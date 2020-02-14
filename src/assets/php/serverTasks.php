<?php
     // in php
     // create activesessions table in sqlitedb
     // create random session id
     // add to activesessions
     // need to return to user
     // when deleteDownloadProgress is called, delete all session info. if not active sessions close and delete db

     // Required binaries: youtube-dl, id3v2 
     require_once('getid3/getid3.php');
     require_once('getid3/write.php');
  
     // The path where the file will be moved to. Make sure the path has a slash at the end
     $audioDestinationPath="/mnt/usb/";
     $videoDestinationPath="/mnt/usb/";
     
     $sourcePath="/var/www/html/media/";
     $domain=(isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"]=="on" ? "https" : "http") . "://" . $_SERVER["HTTP_HOST"] . "/media/";

     //$os=php_uname("s");
     $os=(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? "Windows" : "Unix");
     $rowsLeft=false;
     $db_name="downloadProgress.sqlite3";

     function deleteDownloadProgress() {
	  global $db_name;
	  
          try {
	       if (file_exists($db_name))
                    $result=unlink($db_name);
	           
                    die(json_encode(array($result)));
	  } catch(Exception $e) {
	  }
     }

     function downloadFile() {
	  global $db_name;
          global $domain;
          global $sourcePath;

          $url=htmlspecialchars($_GET["URL"]);
          $fileName=htmlspecialchars($_GET["Filename"]);
          $moveToServer=(isset($_GET["MoveToServer"]) && $_GET["MoveToServer"] == "true" ? true : false);
          $isAudioFormat=(isset($_GET["IsAudioFormat"]) && $_GET["IsAudioFormat"] == "true" ? true : false);
          $isMP3Format=(isset($_GET["Bitrate"]) ? true : false);
          $bitrate=($isAudio == true && isset($_GET["Bitrate"]) ? htmlspecialchars($_GET["Bitrate"]) : "320k");
          $audioFormat=(isset($_GET["AudioFormat"]) ?  htmlspecialchars($_GET["AudioFormat"]) : null);
 
          // Default to MP3 format if $audioformat isn't specified
          if ($isAudioFormat == true && !isset($audioFormat))
               $audioformat="mp3";
 
          $isVideoFormat=(isset($_GET["IsVideoFormat"]) && $_GET["IsVideoFormat"] == true ? true : false);
          $videoFormat=(isset($_GET["VideoFormat"]) && $_GET["VideoFormat"] != "Original" ?  htmlspecialchars($_GET["VideoFormat"]) : null);
          
          if ($isiVideoFormat == true && !isset($videoFormat))
               $videoFormat="mp4";

          $valid_audio_formats=array('0','5','9','128k','192k','256k','320k','aac','flac','m4a','opus','vorbis','wav');
          $valid_video_formats=array('original','mp4','flv','ogg','webm','mkv','avi');
          
          // Validate Audio/Video format
          if (isset($audioFormat) && !in_array($audioFormat,$valid_audio_formats))
               die("Invalid audio format");

          if (isset($videoFormat) && !in_array($videoFormat,$valid_video_formats))
               die("Invalid video format");

          // Delete all of  the files in $sourcePath. This will gives us a way to have automatic cleanup
          $files = glob($sourcePath . "/*");
          
          foreach($files as $file) {
               if (is_file($file))
                    unlink($file);
          }
          
          // Build command that will download the audio/video
          $cmd="youtube-dl " . $url . " -o '" . $sourcePath . $fileName . ".%(ext)s'";
         
          if ($isAudioFormat == true) {
               $cmd=$cmd . " -x";
 
               if ($isMP3Format) {
                    $cmd=$cmd . " --audio-format mp3 --audio-quality " . $bitrate; 
               } else {
                   $cmd=$cmd . " --audio-format " . $audioFormat;
               }
          } else if ($isVideoFormat && $videoFormat != "original") {
              $cmd=$cmd . " --recode-video " . $videoFormat;
          } else if ($isVideoFormat && $videoFormat == "original") {
              $cmd=$cmd . " -f best";
          }
	  ini_set('display_errors',1);
	  ini_set('display_startup_errors',1);
	  error_reporting(E_ALL);

	  // Delete DB if it exists already 
	  try {
	       if (file_exists($db_name))
                    unlink($db_name);
	  } catch(Exception $e) {
	  }

	  // Create database 
	  $file_db = new PDO('sqlite:' . $db_name);

	  // Create the table
	  try {
              $file_db->exec("CREATE TABLE IF NOT EXISTS downloadProgress (id INTEGER PRIMARY KEY, message TEXT, shown BIT);"); 	       
	  } catch(PDOException $e) {
	       die("Unable to create the database");
	  } 
          
          //header('Content-Encoding: none;');

          set_time_limit(0);

          $handle = popen($cmd,"r");

          if (ob_get_level() == 0)
               ob_start();

          while (!feof($handle)) {
              $buffer= fgets($handle);
              $buffer = trim(htmlspecialchars($buffer));
             
	      // echo $buffer . "<br />";
	      if ($buffer != '') {
	           $insert="INSERT INTO downloadProgress(message,shown) VALUES('" . $buffer . "',0)";
	           $stmt=$file_db->prepare($insert);
	           $stmt->execute();
	      }

              ob_flush();

              flush();

              sleep(1);  
          }

          pclose($handle);

          ob_end_flush();

	  // echo json_encode(array(urlencode($fileName)));
          // exec($cmd,$retArr,$retVal);
          
          if ($isAudioFormat) {
               if ($audioFormat != "vorbis") // Vorbis audio files have the extension ogg not vorbis
                    $fileName=$fileName . "." . (!$isMP3Format ? $audioFormat : "mp3");
               else
                    $fileName=$fileName . ".ogg";
          } else if ($isVideoFormat && $videoFormat != 'original') {
                    $fileName=$fileName . "." . $videoFormat;
          } else if ($isVideoFormat && $videoFormat == 'original') { // When the format is original, we don't know the format that video is encoded in so we don't know the file extension so use --get-filename parameter to get the output file name
               exec($cmd . " --get-filename",$videoFileName);
               $fileName=str_replace($sourcePath,"",$videoFileName[0]);
          }
           
          if (!file_exists($sourcePath . $fileName))  {
                // die($cmd . " with the expected file " . $sourcePath . $fileName); // die(json_encode(array("Error: Unable to create the file")));
                die(json_encode(array("Error: Unable to create the file")));
          }

          // If the format is audio and its mp3, try to tag it
          if (!chmod($sourcePath . $fileName,0777)) {
	       die(json_encode(array("Error: Failed to set the file mode")));
          }
 
          // If move To Server is true, we have more steps to process 
          if ($isMP3Format == true || $moveToServer == true) {
	       die(json_encode(array($fileName)));
          } else if ($isMP3Format == false && $moveToServer == false) { // If the file is not MP3, we don't need to write ID3 tags. If MoveTo Server is false, we are done and there are no more steps to process to provide download link
               die(json_encode(array($domain . urlencode($fileName))));
	  }

          /*$cmd="python ../python/aidmatch.py \"" . $sourcePath . $fileName . "\" 2>&1";

	  exec($cmd,$retArr2,$retVal2);

          $tagged=false;

	  /*$artist = "";
	  $title = "";

	  // Since we only care about the first result, we only save the first key value pair
	  foreach ($retArr2 as $key => $value) {
	       // echo "Key: " . $key . " Value: " . $value;
               if ($value=="fingerprint could not be calculated") {
                    break;
               }
          
               $tagged=true;
 
               $tags=$value;

	       $tags=explode(',',$tags);
	       $artist=str_replace('"','',$tags[0]);

	       $title=str_replace('"','',$tags[1]);

	       break;   
	  }

	  // if tagged is false, nothing was written above
	  if ($tagged == false)
	       echo json_encode(array(urlencode($fileName),"",""));
          else 
	       echo json_encode(array(urlencode($fileName),$artist,$title));
          */

          return;
     } 
    
     function getDownloadProgress() {
	  global $db_name;

          $file_db = new PDO('sqlite:' . $db_name);
	  $result=$file_db->query('SELECT id,message FROM downloadProgress WHERE shown=0 LIMIT 1');

	  foreach($result as $result) {
		  $file_db->exec("UPDATE downloadProgress SET shown=1 WHERE id=" . $result['id']);
                  
                  // Store message so we can close DB
                  $message = $result['message'];
                  
                  // CLose DB
                  $file_db = null;

		  die(json_encode(array($message,false))); 
	  }
           
          $file_db = null;

	  die(json_encode(array(null,true))); 
     }

     function getSupportedURLs() {
          $url="https://ytdl-org.github.io/youtube-dl/supportedsites.html";
          
          $curl = curl_init($url);

          $options = array(CURLOPT_RETURNTRANSFER => 1, CURLOPT_URL => $url);
         
          curl_setopt_array($curl,$options); 

          $htmlContent = curl_exec($curl);
 
	  curl_close($curl);
         
	  $dom = new DOMDocument();
         
	  $dom->loadHTML($htmlContent);
         
          $nodes=$dom->getElementsByTagName('li');
          
          $supportedSites = array();

          foreach ($nodes as $currNode) {
               array_push($supportedSites,$currNode->textContent);
          }

          echo json_encode($supportedSites);
     }

     function moveFile() {
          global $audioDestinationPath;
          global $domain;
          global $sourcePath;
          global $videoDestinationPath;

          $fileName=htmlspecialchars($_GET["Filename"]);
          $moveToServer=(isset($_GET["MoveToServer"]) && $_GET["MoveToServer"] == "true" ? true : false);
 
          if (isset($_GET["IsVideoFormat"]) && $_GET["IsVideoFormat"] == true) {
               // Rename the video 
               if ($moveToServer == true) {
                    $res=rename($sourcePath . $fileName,$videoDestinationPath . $fileName);
 
                    if ($res==true) {
                         echo json_encode(array("The video has been moved to the new location"));
                    } else {
                         echo json_encode(array("Error: An error occurred while copying the video to the new location"));
	               }
               } else {
                    echo json_encode(array($domain . urlencode($fileName)));
               }

               return;
          }
	
          $artist=htmlspecialchars($_GET["Artist"]);
          $artist=str_replace("'","",$artist);

          $album=htmlspecialchars($_GET["Album"]);
          $pathBuildSucceeded=false;

          // Try to build path if it exists 
	     if ($moveToServer == true && $artist != null && $artist != "" && $album != null && $album != "") {
               if (file_exists($audioDestinationPath . $artist)==false) {
                    if (mkdir($audioDestinationPath . $artist)) {
                         if (!file_exists($audioDestinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
                              if (mkdir($audioDestinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
                                   // If we were able to create the path with artist and album when it didn't exist before
                                   $pathBuildSucceeded=true;
                              }
                         } else {
                              // If the path artist\album already exists
                              $pathBuildSucceeded=true;
                         }
                    }
	          } else {
	               // Artist already exists so try to create album
                    if (!file_exists($audioDestinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
                         if (mkdir($audioDestinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
                              // If we were able to create the path with artist and album when it didn't exist before
                              $pathBuildSucceeded=true;
                         }
                    } else {
                         // If the path artist\album already exists
                         $pathBuildSucceeded=true;
                    }
	          }
	     }

          if ($pathBuildSucceeded) {
               $audioDestinationPath=$audioDestinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album . ($os=="Windows" ? "\\" : "/");
          }
          
          // Rename the audio file     
          $res=rename($sourcePath . $fileName,$audioDestinationPath . $fileName);
       
          if ($res==true) {
               // Pass the download link and the local file link
               // echo json_encode(array($domain . urlencode($fileName), $sourcePath . urlencode($fileName)));
               echo json_encode(array($domain . urlencode($fileName)));
          } else {
               echo json_encode(array("Error: An error occurred while copying the audio file to the new location"));
	     }

          return;
     }
     
     function writeID3Tags() {
          global $domain;
          global $sourcePath;
    
          $fileName = htmlspecialchars($_GET["Filename"]);
          $isLastStep=(isset($_GET["IsLastStep"]) && $_GET["IsLastStep"] == "true" ? true : false);

          $tagData = array(
               'artist'   => array(htmlspecialchars($_GET["Artist"])),
               'band'     => array(htmlspecialchars($_GET["Artist"])), // album artist
               'album'    => array(($_GET["Album"] != null ? htmlspecialchars($_GET["Album"]) : "")),
               'title'    => array(($_GET["TrackName"] != null ? htmlspecialchars($_GET["TrackName"]) : "")),
               'track'    => array(($_GET["TrackNum"] != null ? htmlspecialchars($_GET["TrackNum"]) : 0)),
               'genre'    => array(($_GET["Genre"] != null ? htmlspecialchars($_GET["Genre"]) : "")),
               'year'     => array(($_GET["Year"] != null ? htmlspecialchars($_GET["Year"]) : 0))
          );
   
          // id3 object 
          $getID3=new getID3;
          $getID3->setOption(array('encoding'=>'UTF-8'));

          $tagWriter = new getid3_writetags;
               
          // Tag writer options
          $tagWriter->filename = $sourcePath . $fileName;
          $tagWriter->tagformats = array('id3v1','id3v2.3');
          $tagWriter->overwrite_tags    = true; 
          $tagWriter->remove_other_tags = false; 
          $tagWriter->tag_encoding      = 'UTF-8';
          $tagWriter->tag_data = $tagData;
              
          $status="Error: ";

          // write tags
          if ($tagWriter->WriteTags()) {
               if (!$isLastStep)
                    die(json_encode(array($domain . urlencode($fileName), $sourcePath . urlencode($fileName))));
               else
                    $status="Successfully wrote the ID3 tags";
	     
               if (!empty($tagWriter->warnings)) {
                    $status .= "There were some warnings: " . implode('<br><br>', $tagWriter->warnings);
               }
          } else {
               $status="Error: Failed to write tags! " . implode('<br><br>', $tagWriter->errors);
          }

          echo json_encode(array($status));

          return;
     }

     if (isset($_GET["DeleteDownloadProgress"])) {
          deleteDownloadProgress();
     }

     if (isset($_GET["DownloadFile"])) {
          // Validate that the required arguments were provided
          $missingParams=false;

          if (!isset($_GET["URL"]) || !isset($_GET["Filename"])) 
               $missingParams=true;
          elseif (isset($_GET["IsAudioFormat"]) && (!isset($_GET["AudioFormat"]) || ($_GET["AudioFormat"] == "MP3" && !isset($_GET["Bitrate"])))) 
               $missingParams=true;
          else if (isset($_GET["IsvideoFormat"]) && !isset($_GET["VideoFormat"])) 
               $missingParams=true;
          
          if ($missingParams==true)
               die("Error: DownloadFile was called but not all audio arguments were provided");
          else
               downloadFile();
     }

     if (isset($_GET["GetDownloadProgress"])) {
          getDownloadProgress();
     }

     if (isset($_GET["MoveFile"])) {
          if (!isset($_GET["Artist"]) || !isset($_GET["Filename"]) || !isset($_GET["MoveToServer"])) 
               $missingParams=true;
         
          if ($missingParams==true)
               die("Error: MoveFile was called but not all arguments were provided");
          else
               moveFile();
     }
     
     if (isset($_GET["GetSupportedURLs"])) {
          getSupportedURLs();
     }

     if (isset($_GET["WriteID3Tags"])) {
          if (!isset($_GET["Artist"]) || !isset($_GET["TrackName"])) 
               $missingParams=true;
          
          if ($missingParams==true)
               die("Error: WriteID3Tags was called but not all audio arguments were provided");
          else
               writeID3Tags();
     }
?>