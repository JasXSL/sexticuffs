<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Super Fantastic Sexticuffs Battle Desu!</title>
  <meta name="description" content="Something furries, sex and fighting">
  <meta name="author" content="That Fucking Cat">
  <link rel="stylesheet" href="css/style.css?<?php echo time() ?>">
  <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
  <![endif]-->
</head>

<body>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>

    <script src="https://code.createjs.com/soundjs-0.6.2.min.js"></script>
    <script src="js/Jasmop.js?"></script> 

    <script src="js/Datatypes.js?"></script>
    <script src="js/Library.js?"></script>
    <script src="js/Game.js?"></script>
    <script src="js/AI.js?"></script>
    <script src="js/IDB.js?"></script>
    <script src="js/AIChat.js?"></script>
    <script src="js/Netcode.js?"></script>
    

<?php

    $dir = scandir(__DIR__.'/pages');
    foreach($dir as $val){
        $spl = explode('.', $val);
        if(array_pop($spl) === 'js'){
            echo '<script src="pages/'.$val.'"></script>';
        }
    }

?>

    
    <script>
        $(function(){
            Game.ini();
        });
    </script>

</body>
</html>