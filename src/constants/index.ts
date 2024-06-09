export const DEFAULT_INSTALL_FEE = process.env.INSTALL_FEE
  ? parseFloat(process.env.INSTALL_FEE)
  : 1200;

export const ADMIN_PASSWORD_HEADER_KEY = "x-rlsd-bst";
