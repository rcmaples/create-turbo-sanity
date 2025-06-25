#!/usr/bin/env node

const path = require('node:path')
const fs = require('node:fs')
const { program } = require('commander')
const chalk = require('chalk')
const spawn = require('cross-spawn')
const inquirer = require('inquirer')
const ora = require('ora')
const validateProjectName = require('validate-npm-package-name')
const { getSanityClient, authenticateUser, selectOrCreateProject, selectOrCreateDataset } = require('./src/sanity-utils')
const { createProjectStructure, updateEnvFiles } = require('./src/template-utils')

let projectName

program
  .name('create-turbo-sanity')
  .description('Create a new Turbo + Next.js + Sanity monorepo')
  .version('1.0.0')
  .argument('[project-directory]', 'directory to create the project in')
  .option('-y, --yes', 'use default options without prompting')
  .option('--project <projectId>', 'Sanity project ID to use')
  .option('--dataset <dataset>', 'Sanity dataset name to use')
  .option('--organization <organizationId>', 'Sanity organization ID to use')
  .option('--template <template>', 'project template to use', 'default')
  .option('--package-manager <manager>', 'package manager to use (npm, yarn, pnpm)', 'pnpm')
  .action(async (name, options) => {
    projectName = name
    await createTurboSanityApp(name, options)
  })

program.parse()

async function createTurboSanityApp(name, options) {
  console.log()
  console.log(chalk.cyan('create-turbo-sanity'))
  console.log()

  // Step 1: Authenticate with Sanity
  console.log(chalk.blue('🔐 Authenticating with Sanity...'))
  const user = await authenticateUser(options)
  console.log()
  
  // Step 2: Select or create project
  console.log(chalk.blue('📋 Setting up Sanity project...'))
  console.log('Fetching existing projects...')
  const { projectId, displayName, isFirstProject } = await selectOrCreateProject(user, options)
  console.log(chalk.green(`✅ Using project: ${displayName} (${projectId})`))
  console.log()
  
  // Step 3: Select or create dataset
  console.log(chalk.blue('📈 Setting up dataset...'))
  const { datasetName } = await selectOrCreateDataset(projectId, options)
  console.log(chalk.green(`✅ Using dataset: ${datasetName}`))
  console.log()
  
  // Step 4: Get project directory
  const projectDir = await getProjectDirectory(name, options)
  console.log(chalk.green(`✅ Creating project in: ${projectDir}`))
  console.log()
  
  // Step 5: Create project structure
  console.log(chalk.blue('📁 Creating project structure...'))
  await createProjectStructure(projectDir, {
    projectName: path.basename(projectDir),
    displayName,
    projectId,
    datasetName,
    template: options.template || 'default'
  })
  
  // Step 6: Update environment files
  console.log(chalk.blue('🔧 Configuring environment variables...'))
  await updateEnvFiles(projectDir, projectId, datasetName)
  
  // Step 7: Install dependencies
  console.log(chalk.blue('📦 Installing dependencies...'))
  await installDependencies(projectDir, options.packageManager || 'pnpm')
  
  // Step 8: Success message
  console.log()
  console.log(chalk.green('✅ Success! Your Turbo + Sanity monorepo has been created.'))
  console.log()
  console.log('Get started by running:')
  console.log()
  console.log(chalk.cyan(`  cd ${path.basename(projectDir)}`))
  console.log(chalk.cyan(`  ${options.packageManager || 'pnpm'} dev`))
  console.log()
  console.log('This will start both the Next.js app and Sanity Studio in development mode.')
  console.log()
  console.log('Other helpful commands:')
  console.log(chalk.cyan('  pnpm sanity:deploy    ') + 'Deploy your Sanity Studio')
  console.log(chalk.cyan('  pnpm sanity:typegen   ') + 'Generate TypeScript types from your schema')
  console.log()
  
  if (isFirstProject) {
    console.log(chalk.blue('Join the Sanity community: https://www.sanity.io/community/join'))
    console.log('We look forward to seeing you there!')
    console.log()
  }
}

async function getProjectDirectory(name, options) {
  let projectName = name
  
  if (!projectName) {
    const { name: inputName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: 'my-turbo-sanity-app',
        validate: (input) => {
          const validation = validateProjectName(input)
          if (!validation.validForNewPackages) {
            return validation.errors?.[0] || validation.warnings?.[0] || 'Invalid project name'
          }
          return true
        }
      }
    ])
    projectName = inputName
  }
  
  const projectDir = path.resolve(process.cwd(), projectName)
  
  // Check if directory exists
  if (fs.existsSync(projectDir)) {
    if (fs.readdirSync(projectDir).length > 0) {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `Directory ${projectName} already exists and is not empty. Continue?`,
          default: false
        }
      ])
      
      if (!proceed) {
        console.log(chalk.yellow('Aborted.'))
        process.exit(1)
      }
    }
  }
  
  return projectDir
}

async function installDependencies(projectDir, packageManager) {
  const spinner = ora('Installing dependencies...').start()
  
  try {
    const result = spawn.sync(packageManager, ['install'], {
      cwd: projectDir,
      stdio: 'pipe'
    })
    
    if (result.status !== 0) {
      throw new Error(`${packageManager} install failed`)
    }
    
    spinner.succeed('Dependencies installed successfully')
  } catch (error) {
    spinner.fail('Failed to install dependencies')
    console.error(error.message)
    process.exit(1)
  }
}
