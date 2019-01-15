#!/bin/bash

BASEURL="http://localhost:8000"

rm -rf ../../plugins-releases
mkdir ../../plugins-releases

echo "[" > ../../plugins-releases/plugins.json

for NAME in *
do
    if [ -d $NAME ];
    then
        echo "Creating plugin archive $NAME"
        pushd .
        cd $NAME
        tar cvfz $NAME.plugin deploy --transform="s|deploy|$NAME|"
        popd
        mv $NAME/$NAME.plugin ../../plugins-releases

        DESC=`cat $NAME/deploy/description`

        cat <<EOR >> ../../plugins-releases/plugins.json
    {
        "Name" : "$NAME",
        "Description" : "$DESC",
        "Icon" : "https://github.com/think-free/axihome5/raw/master/src/plugins/$NAME/icon.png",
        "Path" : "$BASEURL/$NAME.plugin"
    },
EOR
    fi
done

truncate -s-2 ../../plugins-releases/plugins.json
echo "" >> ../../plugins-releases/plugins.json
echo "]" >> ../../plugins-releases/plugins.json
