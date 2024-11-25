class Validator {
  email = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    if (!email) return "Email can't be empty.";
    if (!re.test(email)) return 'Ooops! We need a valid email address.';
    return '';
  };

  name = (name: string) => {
    if (!name) return "Name can't be empty.";
    return '';
  };

  password = (password: string) => {
    if (!password) return "Password can't be empty.";
    if (password.length < 5)
      return 'Password must be at least 5 characters long.';
    return '';
  };

  shortcode = (shortcode: string) => {
    if (!shortcode) return "Short Code can't be empty.";
    if (shortcode.length < 6 || shortcode.length > 6)
      return 'short code must be 6 characters long.';
    return '';
  };
}

export default new Validator();
