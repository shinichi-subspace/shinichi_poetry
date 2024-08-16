const express = require('express');
const path = require('path');
const sass = require('sass');
const fs = require('fs');
const chokidar = require('chokidar');
const pug = require('pug');

const app = express();
const port = 3000;

const compileAllSass = () => {
    const sassDir = path.join(__dirname, 'src/sass');
    fs.readdir(sassDir, (err, files) => {
        if (err) {
            console.error('Error reading Sass directory:', err);
            return;
        }
        files.forEach(file => {
            if (path.extname(file) === '.scss') {
                try {
                    const result = sass.compile(path.join(sassDir, file));
                    fs.writeFileSync(path.join(__dirname, 'public/styles', path.basename(file, '.scss') + '.css'), result.css);
                    console.log(`Sass compiled successfully: ${file}`);
                } catch (error) {
                    console.error(`Error compiling Sass ${file}:`, error);
                }
            }
        });
    });
};

const compileAllPug = () => {
    const viewsDir = path.join(__dirname, 'src/views');
    fs.readdir(viewsDir, (err, files) => {
        if (err) {
            console.error('Error reading views directory:', err);
            return;
        }

        files.forEach(file => {
            if (path.extname(file) === '.pug') {
                try {
                    const html = pug.renderFile(path.join(viewsDir, file));
                    fs.writeFileSync(path.join(__dirname, 'public', path.basename(file, '.pug') + '.html'), html);
                    console.log(`Pug compiled successfully: ${file}`);
                } catch (error) {
                    console.error(`Error compiling Pug ${file}:`, error);
                }
            }
        });
    });
};
const setupRoutes = () => {
    const viewsDir = path.join(__dirname, 'src/views');
    fs.readdir(viewsDir, (err, files) => {
        if (err) {
            console.error('Error reading views directory:', err);
            return;
        }

        files.forEach(file => {
            if (path.extname(file) === '.pug') {
                const routePath = '/' + path.basename(file, '.pug');
                app.get(routePath, (req, res) => {
                    try {
                        const html = pug.renderFile(path.join(viewsDir, file));
                        res.send(html);
                    } catch (error) {
                        console.error(`Error rendering Pug ${file}:`, error);
                        res.status(500).send('Error rendering page');
                    }
                });
                console.log(`Route created for: ${routePath}`);
            }
        });
    });
};

const startServer = () => {
    compileAllSass();
    compileAllPug();
    setupRoutes();

    chokidar.watch('src/sass/**/*.scss').on('change', compileAllSass);
    chokidar.watch('src/views/**/*.pug').on('change', () => {
        compileAllPug();
        setupRoutes();
    });

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.use((req, res, next) => {
        res.status(404).send('404 Not Found');
    });

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
};

startServer();