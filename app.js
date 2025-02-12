const express = require('express');
const app = express();
const PORT = 8080;

// 라우트 연결!
app.use("/",(req,res)=>{
  res.send({msg:"Index"});
});

// 잘못된 Url 404처리
app.get("*", (req, res) => {
  res.render("404");
});

app.listen(PORT, () => {
  console.log(`${PORT}서버시작`);
});
