let skills = '  test, test2 , test3';
console.log(skills);

const test2 = skills.split(',');
const test = skills.split(',').map((skill) => skill.trim());
console.log(test2);
console.log(test);
