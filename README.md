
A node.js module that gets the daily average sensor PM values by querying 
[sensors.Africa api](https:/sensors.africa/v2/data/ "version 2")
# installation

> npm install

# setting environment variables

1. Create a file and name it ` .env `
2. Create variables called ` AUTH_TOKEN ` and ` SENSORS_API ` inside the .env file 
   
   The file contents should look like this:
   >  
   > SENSORS_API=sensors_api
   >
   > AUTH_TOKEN=my_api_token
   > 
# running/ testing
- Open terminal in the same directory and run `node index`.
- Test the code by using different values to the `monthlyAvgData(date,sensorId)` function.
- A ` logs ` folder should be created to log the results.