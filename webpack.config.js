module.exports = {
    context: __dirname,
    entry: {
        //bundle : './sequencer',
        run : './runningWild'
    },
    output: {
        path: __dirname + "/bin",
        filename: "bundle.js"
    }
};