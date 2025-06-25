// packages/create-turbo-sanity/src/template-utils.js

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')

async function createProjectStructure(projectDir, config) {
  const { projectName, displayName, projectId, datasetName, template } = config
  
  const spinner = ora('Creating project structure...').start()
  
  try {
    // Ensure project directory exists
    await fs.ensureDir(projectDir)
    
    // Copy template files
    const templateDir = path.join(__dirname, '..', 'templates', template)
    
    if (!await fs.pathExists(templateDir)) {
      throw new Error(`Template "${template}" not found`)
    }
    
    // Copy all template files
    await fs.copy(templateDir, projectDir)
    
    // Process template files (replace placeholders)
    await processTemplateFiles(projectDir, config)
    
    spinner.succeed('Project structure created')
  } catch (error) {
    spinner.fail('Failed to create project structure')
    throw error
  }
}

async function processTemplateFiles(projectDir, config) {
  const { projectName, displayName, projectId, datasetName } = config
  
  // Files that need template processing
  const filesToProcess = [
    'package.json',
    'apps/web/package.json',
    'apps/studio/package.json',
    'apps/studio/sanity.config.ts',
    'README.md'
  ]
  
  for (const filePath of filesToProcess) {
    const fullPath = path.join(projectDir, filePath)
    
    if (await fs.pathExists(fullPath)) {
      let content = await fs.readFile(fullPath, 'utf8')
      
      // Replace template variables
      content = content
        .replace(/{{PROJECT_NAME}}/g, projectName)
        .replace(/{{DISPLAY_NAME}}/g, displayName)
        .replace(/{{PROJECT_ID}}/g, projectId)
        .replace(/{{DATASET_NAME}}/g, datasetName)
        .replace(/your-project-id/g, projectId)
        .replace(/production/g, datasetName)
      
      await fs.writeFile(fullPath, content)
    }
  }
}

async function updateEnvFiles(projectDir, projectId, datasetName) {
  const envFiles = [
    { path: '.env', template: rootEnvTemplate },
    { path: 'apps/web/.env', template: webEnvTemplate },
    { path: 'apps/studio/.env', template: studioEnvTemplate }
  ]
  
  for (const { path: envPath, template } of envFiles) {
    const fullPath = path.join(projectDir, envPath)
    const content = template(projectId, datasetName)
    
    await fs.writeFile(fullPath, content)
  }
}

function rootEnvTemplate(projectId, datasetName) {
  return `# Sanity Configuration
# Replace with your Sanity project ID
NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}

# Replace with your Sanity dataset name (usually 'production' or 'development')
NEXT_PUBLIC_SANITY_DATASET=${datasetName}

# Optional: Add a read token for private datasets
SANITY_API_READ_TOKEN=
`
}

function webEnvTemplate(projectId, datasetName) {
  return `# Sanity Configuration
# Replace with your Sanity project ID
NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}

# Replace with your Sanity dataset name (usually 'production' or 'development')
NEXT_PUBLIC_SANITY_DATASET=${datasetName}

# Optional: Add a read token for private datasets
SANITY_API_READ_TOKEN=
`
}

function studioEnvTemplate(projectId, datasetName) {
  return `# Sanity Studio Configuration
# Replace with your Sanity project ID
SANITY_STUDIO_PROJECT_ID=${projectId}

# Replace with your Sanity dataset name (usually 'production' or 'development') 
SANITY_STUDIO_DATASET=${datasetName}

# Optional: Add a read token for private datasets
SANITY_API_READ_TOKEN=

# Optional: Add a studio host
SANITY_STUDIO_HOST=
`
}

module.exports = {
  createProjectStructure,
  updateEnvFiles
}
