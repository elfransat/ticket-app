class DateService {
  fetchDate = () => {
    let myDate = new Date();
    myDate.setDate(myDate.getDate());
    const myDateString =
      myDate.getFullYear() +
      ('0' + (myDate.getMonth() + 1)).slice(-2) +
      ('0' + new Date().getDate()).slice(-2);

    var integer = parseInt(myDateString, 10);
    return integer;
  };
}

export default new DateService();
