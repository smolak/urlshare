const map: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

export const escapeXml = (string: string) => {
  return string.replace(/[&<>"']/g, (m) => map[m]);
};
