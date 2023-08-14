#? Command history.
# Create the "src" directory with project directories and their files.
mkdir -p src

touch src/index.html src/main.js src/style.css

projects=("bar-chart" "scatterplot-graph" "heat-map" "choropleth-map" "treemap-diagram")

for project in "${projects[@]}"; do
    mkdir -p src/"$project"
    touch src/"$project"/index.html
    touch src/"$project"/script.js
done

# Initialize the project with yarn
yarn init -y

# Install prettier and prettier plugin for tailwindcss
yarn add -D prettier prettier-plugin-tailwindcss
touch .prettierrc.json

# Install and init eslint
yarn add -D eslint && yarn eslint --init

# Install husky and add pre-commit hook
yarn add -D husky && yarn husky install
yarn husky add .husky/pre-commit "yarn lint"

# Install tailwindcss, postcss and autoprefixer
yarn add -D tailwindcss postcss autoprefixer
yarn tailwindcss init && touch postcss.config.js

# Install vite and create a vite.config.js file
yarn add -D vite && touch vite.config.js

# Install gh-pages
yarn add -D gh-pages