var express = require('express');
var router = express.Router();

var { write } = require("../helpers/fileHelpers");

const fileName = "./data/users.json";
let users = require("../data/users.json");

//==================== GET users (có phân trang, có tìm kiếm từ khóa, có sort). ===========================//
router.get("/", function (req, res, next) {
  const { page = 1, pageSize = 5, search = '', sortBy = 'id', sortOrder = 'asc' } = req.query;

  // Tìm kiếm người dùng dựa trên từ khóa
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    user.lastName.toLowerCase().includes(search.toLowerCase())
  );

  // Sắp xếp người dùng
  const sortedUsers = filteredUsers.sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    return a[sortBy] > b[sortBy] ? order : -order;
  });

  // Phân trang người dùng
  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);

  res.json({ users: paginatedUsers, total: filteredUsers.length });
});

//=========================== GET (params)==========================
router.get("/:id", function (req, res, next) {
  const { id } = req.params;
  const found = users.find((p) => {
    return p.id == id;
  });

  if (!found) {
    return res.status(404).json({ message: "users is not found" });
  }
  res.send(found);
});


//======================= POST :tạo mới =====================================
router.post("/", function (req, res, next) {
  const data = req.body;
  console.log(" Data = ", data);
  users.push(data);

  //write
  // Save to file
  // Tạo một file riêng xong import vào
  write(fileName, users);

  res.sendStatus(201);
});

//============================ Patch :sửa==============================
router.patch("/:id", function (req, res, next) {
  // lấy tên lấy body để sửa
  const { id } = req.params;
  const data = req.body;
  console.log(" Data = ", data);

  //tìm data để sửa
  let found = users.find((p) => {
    return p.id == id;
  });
  //cập nhập data gì ?
  if (found) {
    //cập nhập data gì ?
    for (let x in data) {
      found[x] = data[x];
    }
    //write
    // Save to file
    // Tạo một file riêng xong import vào
    write(fileName, users);

    return res
      .status(200)
      .json({ message: "update users is successfull!" });
  }
  return res.sendStatus(404);
});

//=======================  DELETE (params)=====================================
router.delete("/:id", function (req, res, next) {
  const { id } = req.params;
  const found = users.find((p) => {
    return p.id == id;
  });

  if (!found) {
    return res.status(404).json({ message: "product is not found" });
  }
  let remainusers = users.filter((p) => {
    return p.id != id;
  });

  //write
  // Save to file
  // Tạo một file riêng xong import vào
  users = remainusers;
  write(fileName, users);
  res.sendStatus(200);
});

module.exports = router;
