#!/bin/bash

BASEURL="https://axihome.think-free.me/plugins"

pushd .
cd src/plugins

rm -rf ../../plugins
mkdir ../../plugins
mkdir ../../plugins/icons
mkdir ../../plugins/release

echo "[" > ../../plugins/plugins.json

for NAME in *
do
    if [ -d $NAME ];
    then
        echo "Creating plugin archive $NAME"
        pushd .
        cd $NAME
        tar cvfz $NAME.plugin deploy --transform="s|deploy|$NAME|"
        popd
        mv $NAME/$NAME.plugin ../../plugins/release
	cp $NAME/deploy/icon.png ../../plugins/icons/$NAME.png

        DESC=`cat $NAME/deploy/description`
        VERSION=`cat $NAME/deploy/version`

        cat <<EOR >> ../../plugins/plugins.json
    {
        "Name" : "$NAME",
        "Description" : "$DESC",
        "Icon" : "$BASEURL/icons/$NAME.png",
        "Url" : "$BASEURL/release/$NAME.plugin",
	"Version" : "$VERSION"
    },
EOR
    fi
done

truncate -s-2 ../../plugins/plugins.json
echo "" >> ../../plugins/plugins.json
echo "]" >> ../../plugins/plugins.json

popd
