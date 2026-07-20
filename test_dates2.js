const parseLocal = (isoDate) => {
  if (!isoDate) return new Date();
  const [y, m, d] = isoDate.split('-');
  return new Date(y, m - 1, d);
};
console.log(parseLocal("2026-08-01").toString());
