const express =  require("express")
const next = require("next")
const api = require("./routes") 


const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();

  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  

  
 app.use("/api",api) 

 
  app.get('*', (req, res) => {
    return nextHandler(req, res);
  });

 
  const port = process.env.PORT || 3000;
  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Ready on http://localhost:${port}`);
  });
});
