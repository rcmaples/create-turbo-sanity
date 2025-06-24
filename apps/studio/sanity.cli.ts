import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = process.env.SANITY_STUDIO_DATASET!
const studioHost = process.env.SANITY_STUDIO_HOST!

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost,
  autoUpdates: true,
})
