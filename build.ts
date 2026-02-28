const production = process.argv[2] === "production";

const result = await Bun.build({
    entrypoints: ["src/main.ts"],
    outdir: ".",
    naming: "main.js",
    format: "cjs",
    target: "node",
    sourcemap: production ? "none" : "inline",
    minify: false,
    external: [
        "obsidian",
        "electron",
        "@codemirror/*",
        "@lezer/*",
    ],
});

if (!result.success) {
    console.error("Build failed:");

    for (const log of result.logs) {
        console.error(log);
    }

    process.exit(1);
}

console.log("Build succeeded");
