// packages/create-turbo-sanity/src/sanity-utils.js

const { createClient } = require('@sanity/client')
const chalk = require('chalk')
const inquirer = require('inquirer')
const ora = require('ora')
const spawn = require('cross-spawn')
const path = require('path')
const fs = require('fs')
const https = require('https')

// Get user config similar to how Sanity CLI does it
function getUserConfig() {
  const os = require('os')
  
  // Try multiple possible config locations
  const possiblePaths = [
    path.join(os.homedir(), '.config', 'sanity', 'config'),
    path.join(os.homedir(), '.sanity', 'config'),
    path.join(os.homedir(), '.config', 'sanity', 'config.json'),
    path.join(os.homedir(), '.sanity', 'config.json'),
    path.join(os.homedir(), '.config', '@sanity', 'cli', 'config'),
    path.join(os.homedir(), '.sanity-cli', 'config')
  ]
  
  for (const configPath of possiblePaths) {
    try {
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8')
        const config = JSON.parse(configContent)
        return config
      }
    } catch (err) {
      // Continue to next path if this one fails
    }
  }
  
  return {}
}

// Make direct HTTP requests to Sanity API without needing a projectId
async function makeApiRequest(path, token, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.sanity.io',
      port: 443,
      path: `/v2023-05-03${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (res.statusCode >= 400) {
            reject(new Error(`API Error: ${parsed.message || 'Unknown error'}`))
          } else {
            resolve(parsed)
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`))
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

function getSanityClient(options = {}) {
  const userConfig = getUserConfig()
  
  const config = {
    apiVersion: '2023-05-03',
    useCdn: false,
    token: userConfig.authToken,
    ...options
  }
  
  // Don't add projectId for general API calls
  // The client will use api.sanity.io instead of project-specific URLs
  
  return createClient(config)
}

async function authenticateUser(options) {
  const userConfig = getUserConfig()
  
  if (userConfig.authToken) {
    // User is already authenticated, verify the token works
    try {
      const user = await makeApiRequest('/users/me', userConfig.authToken)
      console.log(chalk.green(`✅ You are logged in as ${user.email}`))
      return user
    } catch (err) {
      console.log(chalk.yellow('⚠️  Stored authentication token is invalid'))
    }
  }
  
  if (options.yes) {
    throw new Error('Authentication required. Please run `sanity login` first when using --yes flag.')
  }
  
  console.log(chalk.yellow('🔐 Authentication required'))
  console.log('Opening browser for Sanity authentication...')
  
  // Use the Sanity CLI to handle authentication
  const result = spawn.sync('npx', ['@sanity/cli', 'login'], {
    stdio: 'inherit'
  })
  
  if (result.status !== 0) {
    throw new Error('Authentication failed')
  }
  
  // Get user info after successful authentication
  // Wait a moment for the auth token to be written to disk
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Try to refresh the user config multiple times
  let updatedConfig = null
  let attempts = 0
  const maxAttempts = 5
  
  while (!updatedConfig?.authToken && attempts < maxAttempts) {
    attempts++
    updatedConfig = getUserConfig()
    
    if (!updatedConfig?.authToken) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  if (!updatedConfig?.authToken) {
    throw new Error('Authentication completed but token not found. Please try running `sanity login` manually and try again.')
  }
  
  const user = await makeApiRequest('/users/me', updatedConfig.authToken)
  
  console.log(chalk.green(`✅ Login successful! Welcome, ${user.email}`))
  return user
}

async function selectOrCreateProject(user, options) {
  const userConfig = getUserConfig()
  const token = userConfig.authToken
  
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  // If project ID is specified, validate and use it
  if (options.project) {
    try {
      const project = await makeApiRequest(`/projects/${options.project}`, token)
      
      return {
        projectId: options.project,
        displayName: project.displayName,
        isFirstProject: false
      }
    } catch (err) {
      throw new Error(`Project ${options.project} not found or you don't have access to it`)
    }
  }
  
  // Get user's projects
  let projects = []
  let organizations = []
  
  try {
    const [projectsResult, organizationsResult] = await Promise.all([
      makeApiRequest('/projects?includeMembers=false', token),
      makeApiRequest('/organizations', token)
    ])
    
    projects = projectsResult
    organizations = organizationsResult
    
    projects = projects.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch (err) {
    throw new Error(`Failed to fetch projects: ${err.message}`)
  }
  
  const isFirstProject = projects.length === 0
  
  if (options.yes) {
    if (isFirstProject) {
      throw new Error('No projects found. Please create a project first or remove --yes flag.')
    }
    // Use the most recent project
    return {
      projectId: projects[0].id,
      displayName: projects[0].displayName,
      isFirstProject: false
    }
  }
  
  if (isFirstProject) {
    console.log(chalk.blue('🎉 This appears to be your first Sanity project!'))
    
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'My Turbo Sanity Project',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'Project name cannot be empty'
          }
          if (input.length > 80) {
            return 'Project name cannot be longer than 80 characters'
          }
          return true
        }
      }
    ])
    
    const organizationId = await selectOrganization(organizations, options)
    
    return createProject(client, {
      displayName: projectName.trim(),
      organizationId
    })
  }
  
  // Show list of existing projects + option to create new
  const projectChoices = projects.map(project => ({
    value: project.id,
    name: `${project.displayName} (${project.id})`
  }))
  
  const { selectedProject } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedProject',
      message: 'Select a project or create a new one:',
      choices: [
        { value: 'new', name: '🆕 Create new project' },
        new inquirer.Separator(),
        ...projectChoices
      ]
    }
  ])
  
  if (selectedProject === 'new') {
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'My Turbo Sanity Project'
      }
    ])
    
    const organizationId = await selectOrganization(organizations, options)
    
    return createProject(client, {
      displayName: projectName.trim(),
      organizationId
    })
  }
  
  const selectedProjectData = projects.find(p => p.id === selectedProject)
  return {
    projectId: selectedProject,
    displayName: selectedProjectData.displayName,
    isFirstProject: false
  }
}

async function selectOrganization(organizations, options) {
  if (options.organization) {
    const org = organizations.find(o => o.id === options.organization || o.slug === options.organization)
    if (!org) {
      throw new Error(`Organization ${options.organization} not found`)
    }
    return org.id
  }
  
  if (organizations.length === 0) {
    // Create new organization
    const { orgName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'orgName',
        message: 'Organization name:',
        validate: (input) => {
          if (input.length === 0) {
            return 'Organization name cannot be empty'
          }
          if (input.length > 100) {
            return 'Organization name cannot be longer than 100 characters'
          }
          return true
        }
      }
    ])
    
    const client = getSanityClient()
    const org = await client.request({
      method: 'POST',
      uri: '/organizations',
      body: { name: orgName }
    })
    
    return org.id
  }
  
  if (organizations.length === 1) {
    return organizations[0].id
  }
  
  const { selectedOrg } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedOrg',
      message: 'Select organization:',
      choices: [
        ...organizations.map(org => ({
          value: org.id,
          name: `${org.name} [${org.id}]`
        })),
        new inquirer.Separator(),
        { value: 'new', name: '🆕 Create new organization' }
      ]
    }
  ])
  
  if (selectedOrg === 'new') {
    const { orgName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'orgName',
        message: 'Organization name:'
      }
    ])
    
    const client = getSanityClient()
    const org = await client.request({
      method: 'POST',
      uri: '/organizations',
      body: { name: orgName }
    })
    
    return org.id
  }
  
  return selectedOrg
}

async function createProject(client, { displayName, organizationId, subscription, metadata }) {
  const spinner = ora('Creating Sanity project...').start()
  
  try {
    const project = await client.request({
      method: 'POST',
      uri: '/projects',
      body: {
        displayName,
        organizationId,
        subscription,
        metadata
      }
    })
    
    spinner.succeed(`Project "${displayName}" created successfully`)
    
    return {
      projectId: project.id,
      displayName: project.displayName,
      isFirstProject: true
    }
  } catch (err) {
    spinner.fail('Failed to create project')
    throw new Error(`Failed to create project: ${err.message}`)
  }
}

async function selectOrCreateDataset(projectId, options) {
  const client = getSanityClient({ projectId })
  
  // If dataset is specified, validate and use it
  if (options.dataset) {
    try {
      const datasets = await client.datasets.list()
      const existing = datasets.find(ds => ds.name === options.dataset)
      
      if (!existing) {
        console.log(chalk.blue(`Creating dataset "${options.dataset}"...`))
        await client.datasets.create(options.dataset, { aclMode: 'public' })
      }
      
      return { datasetName: options.dataset }
    } catch (err) {
      throw new Error(`Failed to create/validate dataset: ${err.message}`)
    }
  }
  
  // Get existing datasets
  let datasets = []
  
  try {
    datasets = await client.datasets.list()
  } catch (err) {
    throw new Error(`Failed to fetch datasets: ${err.message}`)
  }
  
  if (options.yes) {
    if (datasets.length === 0) {
      // Create default 'production' dataset
      await client.datasets.create('production', { aclMode: 'public' })
      return { datasetName: 'production' }
    }
    // Use first dataset
    return { datasetName: datasets[0].name }
  }
  
  if (datasets.length === 0) {
    console.log(chalk.blue('📊 Setting up your first dataset'))
    console.log('Your content will be stored in a dataset. This can be public or private.')
    
    const { useDefaultDataset } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useDefaultDataset',
        message: 'Use default dataset configuration? (public dataset named "production")',
        default: true
      }
    ])
    
    if (useDefaultDataset) {
      await client.datasets.create('production', { aclMode: 'public' })
      return { datasetName: 'production' }
    }
    
    const { datasetName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'datasetName',
        message: 'Dataset name:',
        default: 'production',
        validate: (input) => {
          if (!input || !input.match(/^[a-z0-9_-]+$/)) {
            return 'Dataset name can only contain lowercase letters, numbers, hyphens, and underscores'
          }
          return true
        }
      }
    ])
    
    await client.datasets.create(datasetName, { aclMode: 'public' })
    return { datasetName }
  }
  
  // Show existing datasets + option to create new
  const datasetChoices = datasets.map(dataset => ({
    value: dataset.name,
    name: dataset.name
  }))
  
  const { selectedDataset } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedDataset',
      message: 'Select dataset to use:',
      choices: [
        { value: 'new', name: '🆕 Create new dataset' },
        new inquirer.Separator(),
        ...datasetChoices
      ]
    }
  ])
  
  if (selectedDataset === 'new') {
    const existingNames = datasets.map(ds => ds.name)
    
    const { datasetName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'datasetName',
        message: 'Dataset name:',
        default: 'production',
        validate: (input) => {
          if (!input || !input.match(/^[a-z0-9_-]+$/)) {
            return 'Dataset name can only contain lowercase letters, numbers, hyphens, and underscores'
          }
          if (existingNames.includes(input)) {
            return 'Dataset name already exists'
          }
          return true
        }
      }
    ])
    
    await client.datasets.create(datasetName, { aclMode: 'public' })
    return { datasetName }
  }
  
  return { datasetName: selectedDataset }
}

module.exports = {
  getSanityClient,
  authenticateUser,
  selectOrCreateProject,
  selectOrCreateDataset
}
