const { spawnSync } = require('child_process');
const path = require('path');

const getStdout = (script) => {
  const result = spawnSync(script, { shell: true });
  // 检查是否有错误发生
  if (result.error) {
    console.error('命令执行出错:', result.error);
    process.exit(1);
  }
  return result.stdout.toString();
}

const run = (script) => {
  console.log('RUN:\n', script, '\n');
  return spawnSync(script, { stdio: 'inherit', shell: true });
}

const hasDocker = getStdout('docker -v')?.includes('version');
const hasGit = getStdout('git -v')?.includes('version');
const IMAGE_NAME = `docker-git:latest`;
const imageHash = getStdout(`docker images -q ${IMAGE_NAME}`)?.trim();

if (hasDocker && hasGit) {
  if (!imageHash) {
    const dockerfilePath = path.resolve(__dirname, '../Dockerfile');
    run(`docker build -t ${IMAGE_NAME} -f ${dockerfilePath} .`);
  }
  const cwd = process.cwd();
  const project = cwd.split('/').pop();
  const args = process.argv.slice(2);

  const script = `docker run -e ACTION="${args.join(' ')}" --volume ~/.ssh:/root/.ssh --volume ~/.gitconfig:/root/.gitconfig --volume /root/${project}/node_modules --volume ${cwd}:/root/${project} --workdir /root/${project} --name ${project} --rm -it ${IMAGE_NAME}`;
  run(script);
}

