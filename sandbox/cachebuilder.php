<?php




function listFolderFiles($dir){
    $ffs = scandir($dir);

    unset($ffs[array_search('.', $ffs, true)]);
    unset($ffs[array_search('..', $ffs, true)]);

    // prevent empty ordered elements
    if (count($ffs) < 1)
        return;

    foreach($ffs as $ff){
        
        if(is_dir($dir.'/'.$ff)) listFolderFiles($dir.'/'.$ff);
        else{
            $spl = explode('.', $ff);
            if(array_pop($spl) === 'bak')
                continue;
            echo "      '".$dir.'/'.$ff."',\n";
        }
    }
}

// SWHelper
$dirs = array(
    'media/img',
    'css',
    'js',
    'pages',
    'media'
);

$files = array(
    '/',
    'index.php',
    'manifest.json',
    'favicon.ico',
    'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js',
    'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'
);

echo '<pre>';

foreach($files as $val){
    echo "      '".$val."',\n";
}

foreach($dirs as $val){
    listFolderFiles($val);
}
echo '</pre>';
