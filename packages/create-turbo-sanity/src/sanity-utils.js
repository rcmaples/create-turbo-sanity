// packages/create-turbo-sanity/src/sanity-utils.js

const { createClient } = require('@sanity/client')
const chalk = require('chalk')
const inquirer = require('inquirer')
const ora = require('ora')
const spawn = require('cross-spawn')
const path = require('path')
const fs = require('fs')

// Get user config similar to how Sanity CLI does it
function getUserConfig() {
  const os = require('os')
  const configPath = path.join(os.homedir(), '.config', 'sanity', 'config')
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      return config
    }
  } catch (err) {
    // Config file doesn't exist or is invalid
  }
  
  return {}
}

function getSanityClient(options = {}) {
  const userConfig = getUserConfig()
  
  return createClient({
    apiVersion: '2023-05-03',
    useCdn: false,
    token: userConfig.authToken,
    ...options
  })
}

async function authenticateUser(options) {
  const userConfig = getUserConfig()
  
  if (userConfig.authToken) {
    // User is already authenticated, verify the token works
    try {
      const client = getSanityClient()
      const user = await client.request({
        method: 'GET',
        uri: 'users/me'
      })
      
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
  const client = getSanityClient()
  const user = await client.request({
    method: 'GET',
    uri: 'users/me'
  })
  
  return user
}

async function selectOrCreateProject(user, options) {
  const client = getSanityClient()
  
  // If project ID is specified, validate and use it
  if (options.project) {
    try {
      const project = await client.request({
        method: 'GET',
        uri: `/projects/${options.project}`
      })
      
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
    [projects, organizations] = await Promise.all([
      client.request({ uri: '/projects?includeMembers=false' }),
      client.request({ uri: '/organizations' })
    ])
    
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
