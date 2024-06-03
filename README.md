# Hosting Guide

1. Fork this repository to your GitHub account
   <img src="assets/fork.png"/>
2. Create A Vercel Account [here](https://vercel.com/signup)
3. Choose the lowest tier plan that is not free (this is required in order to setup the data storage)
4. Connect your GitHub account to Vercel
5. Create a new project on the vercel dashboard
   <img src="assets/add-new-project.png"/>
6. Import Repository and Launch Project
   <img src="assets/import-repo.png"/>
   <img src="assets/deploy.png"/>
7. Go back to your dashboard and click on the project you just created
8. Go to the `storage` tab
   - Note: The first deploy should have failed because we haven't setup storage yet
     <img src="assets/storage.png"/>
9. Add Postgres
   - Click yes on all subsequent messages
     <img src="assets/create-pg.png"/>
10. Go into `deployments`
    <img src="assets/deployments.png"/>
11. Hit `redeploy` on the latest deployment to register the new storage
    <img src="assets/redeploy.png"/>
12. Wait for the build to finish, go back to dashboard, and find your deployment URL
    <img src="assets/find-domain.png"/>
