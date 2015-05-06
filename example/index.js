var debug = require("debug")("express-socket.io-session:example"),
  app = require('express')(),
  server = require("http").createServer(app),
  io = require("socket.io")(server),
  session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  }),
  sharedsession = require("../");


// Attach session
app.use(session);

// Share session with io sockets
io.use(sharedsession(session));


//Debugging express
app.use("*", function(req, res, next) {
  debug("Express `req.session` data is %j.", req.session);
  next();
});
// Debugging io
io.use(function(socket, next) {
  debug("socket.handshake session data is %j.", socket.handshake.session);
  next();
});

app.use(require("express").static(__dirname));

// Set session data via express request
app.use("/login", function(req, res, next) {
  req.session.user = {
    username: "OSK"
  };
  req.session.save();
  res.redirect("/");
});
// Unset session data via express request
app.use("/logout", function(req, res, next) {
  delete req.session.user;
  req.session.save();
  res.redirect("/");
});


io.on("connection", function(socket) {
  socket.emit("sessiondata", socket.handshake.session);
  // Set session data via socket
  socket.on("login", function() {
    socket.handshake.session.user = {
      username: "OSK"
    };
    socket.handshake.session.save();
    //emit logged_in for debugging purposes of this example
    socket.emit("logged_in", socket.handshake.session);
  });
  // Unset session data via socket
  socket.on("logout", function() {
    delete socket.handshake.session.user;
    socket.handshake.session.save();
    //emit logged_out for debugging purposes of this example
    socket.emit("logged_out", socket.handshake.session);
  });
});


server.listen(3000);