const tasks = [
  { dueDate: '2026-07-20' },
  { dueDate: '2026-08-15' }
];

let min = new Date();
let max = new Date();
if (tasks.length > 0) {
  min = new Date(tasks[0].dueDate);
  max = new Date(tasks[0].dueDate);
  tasks.forEach(t => {
    const d = new Date(t.dueDate);
    if (d < min) min = d;
    if (d > max) max = d;
  });
}
const today = new Date('2026-07-19T10:00:00Z');
if (today < min) min = today;
if (today > max) max = today;

min.setDate(1); min.setHours(0, 0, 0, 0);
max.setDate(1); max.setHours(0, 0, 0, 0);

console.log("Min:", min);
console.log("Max:", max);

const viewMonth = new Date('2026-07-01T00:00:00Z');
const nextMonth = new Date(viewMonth);
nextMonth.setMonth(nextMonth.getMonth() + 1);

console.log("Next Month:", nextMonth);
console.log("Can Go Next?", nextMonth <= max);
