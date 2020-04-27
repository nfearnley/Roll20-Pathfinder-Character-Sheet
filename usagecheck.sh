for f in src/PF*.js; do
    MODULE=$(basename $f .js);
    echo -e \\nMODULE: $MODULE;
    diff <(
        grep "$MODULE\.[a-zA-Z_]*[^a-zA-Z_]" src/* -oh --exclude $MODULE.js |
        sed "s/$MODULE\.\([a-zA-Z_]*\)[^A-Za-z_]/\1/p" |
        sort |
        uniq
    ) <(
        grep -E '^export (var|function) [^ (]*' src/$MODULE.js -o |
        sed "s/export [^ ]* \(.*\)/\1/p" |
        sort |
        uniq
    );
done

echo --------------

for f in src/PF*.js; do
    MODULE=$(basename $f .js);
    echo -e \\nMODULE: $MODULE;
    cat <(
        grep "$MODULE\.[a-zA-Z_]*[^a-zA-Z_]" src/* -oh --exclude $MODULE.js |
        sed "s/$MODULE\.\([a-zA-Z_]*\)[^A-Za-z_]/\1.use/p" |
        sort |
        uniq
    ) <(
        grep -E '^export (var|function) [^ (]*' src/$MODULE.js -o |
        sed "s/export [^ ]* \(.*\)/\1.exp/p" |
        sort |
        uniq
    ) | sort;
done
