<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Super Sexticuffs!</title>
  <meta name="description" content="Something furries, sex and fighting">
  <meta name="author" content="That Fucking Cat">
  
  <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
  <![endif]-->

  <!-- Meta & CSS in head -->
    <link rel="stylesheet" href="css/style.css?<?php echo time() ?>">
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
    <link rel="manifest" href="manifest.json?v=2" /> 
    <link rel="icon" href="/media/logo-32.png">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">

</head>

<body>
    <!-- Scripts go in body -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/3.13.3/math.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="js/libraries/jquery.ui.touch-punch.min.js"></script>
    <script src="js/libraries/createjs-2015.11.26.min.js"></script>
    <script src="js/Jasmop.js?"></script> 
    <script src="js/Datatypes.js?"></script>
    <script src="js/Battle.js?"></script> 
    <script src="js/Game.js?"></script>
    <script src="js/AI.js?"></script>
    <script src="js/IDB.js?"></script>
    <script src="js/AIChat.js?"></script>
    <script src="js/Netcode.js?"></script>
    <script src="js/Library.js?"></script>
    <script src="js/Mod.js?"></script>
    

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