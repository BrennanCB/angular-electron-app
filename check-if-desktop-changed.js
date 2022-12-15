const execSync = require('child_process').execSync;

function test(baseSha) {
  const array = JSON.parse(
    execSync(`npx nx print-affected --type=app --base=${baseSha}`)
      .toString()
      .trim()
  ).tasks.map((t) => t.target.project);

  execSync(`echo ${array}`);
}

console.log(process.argv)

test(process.argv.slice(1))
