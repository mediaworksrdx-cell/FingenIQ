
setTimeout(() => {
    console.log('Self-terminating PID for systemd restart...');
    process.exit(0);
}, 100);

module.exports = {
    GET: async function() {
        setTimeout(() => { process.exit(0); }, 100);
        return new Response(JSON.stringify({ restarting: true }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
};
