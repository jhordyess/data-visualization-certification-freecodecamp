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
