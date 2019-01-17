#!/bin/bash

BASEURL="https://axihome.think-free.me/plugins"

pushd .
cd src/plugins

rm -rf ../../plugins-releases
mkdir ../../plugins-releases
mkdir ../../plugins-releases/icons
mkdir ../../plugins-releases/release

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
        mv $NAME/$NAME.plugin ../../plugins-releases/release
	cp $NAME/deploy/icon.png ../../plugins-releases/icons/$NAME.png

        DESC=`cat $NAME/deploy/description`
        VERSION=`cat $NAME/deploy/version`

        cat <<EOR >> ../../plugins-releases/plugins.json
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

truncate -s-2 ../../plugins-releases/plugins.json
echo "" >> ../../plugins-releases/plugins.json
echo "]" >> ../../plugins-releases/plugins.json

popd
