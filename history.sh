#? Command history.
# Create the "docs" directory with project directories and their files.
mkdir -p docs

touch docs/index.html

projects=("bar-chart" "scatterplot-graph" "heat-map" "choropleth-map" "treemap-diagram")

for project in "${projects[@]}"; do
    mkdir -p docs/"$project"
    touch docs/"$project"/index.html
    touch docs/"$project"/style.css
    touch docs/"$project"/script.js
done

# Initialize the project with yarn
yarn init -y

# Install prettier and prettier plugin for tailwindcss
yarn add -D prettier prettier-plugin-tailwindcss

# Install and init eslint
yarn add -D eslint && yarn eslint --init

# Install husky & enable git hooks
yarn add -D husky && yarn husky install
yarn husky add .husky/pre-commit "yarn lint"

# Install tailwindcss
yarn add -D tailwindcss && yarn tailwindcss init
yarn husky add .husky/pre-commit "yarn tailwindcss:build"