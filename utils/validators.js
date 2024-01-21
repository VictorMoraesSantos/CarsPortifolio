exports.emailValidator = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

exports.carValidator = (body) => {
  const regChassis =
    /^[A-Za-z0-9]{3,3}[A-Za-z0-9]{6,6}[A-Za-z0-9]{2,2}[A-Za-z0-9]{6,6}$/;

  const { vehicle, brand, year, description, chassis, price } = body;

  if (
    !vehicle ||
    !brand ||
    year < 1900 ||
    year > new Date().getFullYear() ||
    !description ||
    !chassis ||
    !regChassis.test(chassis) ||
    price === null ||
    price === undefined ||
    price < 5000
  ) {
    return false;
  }
  return true;
};
