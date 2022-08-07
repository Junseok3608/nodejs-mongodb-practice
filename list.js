$.ajax({
  method: "DELETE",
  url: "/delete",
  data: "123",
}).done(function (result) {
  console.log(result);
});
