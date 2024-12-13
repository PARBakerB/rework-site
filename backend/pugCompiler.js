import pug from "pug";

const compilePug = (file, options) => {
    console.log("Compiling pug file: " + file)
    const compiledFunction = pug.compileFile(file);
    const compiledHtml = compiledFunction(options);
    return compiledHtml;
};

export { compilePug };