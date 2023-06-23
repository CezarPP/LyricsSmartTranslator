export function startAuthMicroservice() {
    const spawn = require('cross-spawn');
    const authMicroservice = spawn('npm', ['start'], {cwd: './src/auth-microservice'});

    process.on('uncaughtException', function (err) {
        console.error('Caught exception: ' + err);
        authMicroservice.kill();
        process.exit(1);
    });

    process.on('exit', function () {
        authMicroservice.kill();
    });

    process.on('SIGINT', function () {
        authMicroservice.kill();
        process.exit();
    });

    authMicroservice.on('exit', (code: any) => {
        console.log(`Child exited with code ${code}`);
        if (code !== 0) {
            console.log('Restarting the service...');
            startAuthMicroservice();
        }
    });
}