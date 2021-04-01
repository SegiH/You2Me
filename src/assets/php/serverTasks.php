<?php
     // Required binaries: youtube-dl, id3v2 
     require_once('getid3/getid3.php');
     require_once('getid3/write.php');
     
     /*ini_set('display_errors',1);
     ini_set('display_startup_errors',1);
     error_reporting(E_ALL);*/

     // The path where the file will be moved to. Make sure the path has a slash at the end
     $audioDestinationPath="/mnt/usb/";
     $videoDestinationPath="/mnt/usb/";
     
     $sourcePath="/var/www/html/media/";
     $domain="https://" . $_SERVER["HTTP_HOST"] . "/media/";

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
          global $os;
          global $sourcePath;

          $url=$_GET["URL"];
	  $fileName=$_GET["Filename"];
          $moveToServer=(isset($_GET["MoveToServer"]) && $_GET["MoveToServer"] == "true" ? true : false);
          $allowMoveToServer=(isset($_GET["AllowMoveToServer"]) && $_GET["AllowMoveToServer"] == "true" ? true : false);
          $debugging=(isset($_GET["Debugging"]) && $_GET["Debugging"] == "true" ? true : false);
          $isAudioFormat=(isset($_GET["IsAudioFormat"]) && $_GET["IsAudioFormat"] == "true" ? true : false);
          $isMP3Format=(isset($_GET["Bitrate"]) ? true : false);
          $bitrate=($isAudioFormat == true && isset($_GET["Bitrate"]) ? $_GET["Bitrate"] : "320k");
          $audioFormat=(isset($_GET["AudioFormat"]) ?  $_GET["AudioFormat"] : null);

          // Default to MP3 format if $audioformat isn't specified
          if ($isAudioFormat == true && !isset($audioFormat))
               $audioformat="mp3";
 
          $isVideoFormat=(isset($_GET["IsVideoFormat"]) && $_GET["IsVideoFormat"] == true ? true : false);
          $videoFormat=(isset($_GET["VideoFormat"]) && $_GET["VideoFormat"] != "Original" ?  $_GET["VideoFormat"] : null);
          
          if ($isVideoFormat == true && !isset($videoFormat))
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
          $cmd="youtube-dl " . $url . " -o " . ($os != "Windows" ? "\"" : "") . $sourcePath . $fileName . ".%(ext)s" . ($os != "Windows" ? "\"" : "");

          if ($isAudioFormat == true) {
               $cmd=$cmd . " -x";
 
               if ($isMP3Format)
                    $cmd=$cmd . " --audio-format mp3 --audio-quality " . $bitrate; 
               else
                   $cmd=$cmd . " --audio-format " . $audioFormat;
          } else if ($isVideoFormat && $videoFormat != "original") {
               $cmd=$cmd . " --recode-video " . $videoFormat;
          } else if ($isVideoFormat && $videoFormat == "original") {
               $cmd=$cmd . " -f best";
          }

	  if ($debugging == false) {
               // Download progress
               try {
                    if (file_exists($db_name))
                         unlink($db_name);
               } catch(Exception $e) {
               }

               // Create database 
	       $file_db = new PDO('sqlite:' . $db_name);
	       $file_db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

               // Create the table. If it exists already, the 1st sql won't run so the 2nd command deletes everything from this table
               try {
		       $file_db->exec("CREATE TABLE IF NOT EXISTS downloadProgress (id INTEGER PRIMARY KEY,URL TEXT, message TEXT);DELETE FROM DownloadProgress;");
		       chmod($file_db,755);
               } catch(PDOException $e) {
                    die("Unable to create the database");
     	       }
	  }
      
          $handle = popen($cmd,"r");

          if (ob_get_level() == 0)
                ob_start();
	  
          while (!feof($handle)) {
               $buffer= fgets($handle);
               $buffer = trim($buffer);
               
	       if ($buffer != '' && $debugging == false) {
                    $insert="INSERT INTO downloadProgress(URL,message) VALUES(?,?)";
		    $stmt=$file_db->prepare($insert);
		    $stmt->bindValue(1,$url,PDO::PARAM_STR);
		    $stmt->bindValue(2,str_replace("'","''",$buffer),PDO::PARAM_STR);
		    $stmt->execute();
	       }
	  }

          pclose($handle);

	  ob_end_flush();
         
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

          if (!file_exists($sourcePath . $fileName))
               die(json_encode(array("Error: An error occurred downloading the file",$cmd)));

          // If the format is audio and its mp3, try to tag it
          if (!chmod($sourcePath . $fileName,0777))
               die(json_encode(array("Error: Failed to set the file mode")));

	  //var_dump($moveToServer==false);
	  //die(""):
	  // continue here debug why retult is returning "","" fornon-mp3 format

          // If move To Server is not true or the format is not an audio format, we have no more steps to process 
          if ($isMP3Format == false || $moveToServer == false) // If the file is not MP3, we don't need to write ID3 tags. If MoveTo Server is false, we are done and there are no more steps to process to provide download link
               die(json_encode(array($domain . urlencode($fileName))));

          // Start of Python fingerprinting
          $cmd="python3 ../python/aidmatch.py \"" . $sourcePath . $fileName . "\" 2>&1";

          exec($cmd,$retArr2,$retVal2);

          $tagged=false;

          $artist = "";
          $title = "";

          // Since we only care about the first result, we only save the first key value pair
          foreach ($retArr2 as $key => $value) {
               // A traceback may happen if no match was made
               if ($value=="fingerprint could not be calculated" || strpos($value,"Traceback") !== false)
                    break;
            
               $tags=$value;

               $tags=explode(',',$tags);

	       if ($tags[0] != "\"\"" && $tags[1] != "\"\"") {
		    $artist=str_replace('"','',$tags[0]);
                    $title=str_replace('"','',$tags[1]);
                    $tagged=true;
               }

               break;
          }

          // if tagged is false, nothing was written above
          if ($tagged == false)
               echo json_encode(array(urlencode($fileName),"",""));
          else { 
               // If the track was tagged, create new filename based on artist  
               chdir($sourcePath);

               $newFileName=$artist . " - " . $title . ".mp3";
            
               $cmd="mv " . chr(34) . $fileName . chr(34) . " " . chr(34) . $newFileName . chr(34);

               exec($cmd,$retArr2,$retVal2);

               $fileName=$newFileName;

               echo json_encode(array(urlencode($fileName),$artist,$title));
          }

	  return;
     }

     function getAPIKey() {
	  try {
	       $conn = new PDO("sqlsrv:server=SQLServer;Database=You2Me", "You2Me","You2Me2021");
               $conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
          } catch(Exception $e) {
               die( print_r( $e->getMessage() ) );
          }
    
          $apiKey="";

	  // Get all Formats 
          $sql="SELECT KeyValue FROM Settings WHERE KeyName='YTAPIKey'";

          $stmt = $conn->prepare($sql);
	       
	  try { 
	       $stmt->execute();
	  } catch(Exception $e) {
	       die("Something went wrong getting the formats with the error " . $e);
	  }
	       
	  while ($row = $stmt->fetch()) {
               $apiKey = $row[0];
	  }
	  
	  echo json_encode($apiKey);
     } 
     function getThumbnail($url) {
          $cmd="youtube-dl " . $url . " --get-thumbnail --skip-download";

	  $handle = popen($cmd,"r");

          if (ob_get_level() == 0)
                ob_start();
	  
          while (!feof($handle)) {
               $buffer= fgets($handle);
	       die(json_encode(array($buffer,$_GET["StepperIndex"])));
               // $buffer = trim($buffer);
               
	       /*if (strpos($buffer,"Writing thumbnail") != false) {
		       $bufferArr=explode(": ",$buffer);
	               die(json_encode(array($bufferArr[2])));
	       }*/
	  }

          pclose($handle);

	  ob_end_flush();
     }
     
     function getFormats() {
	  try {
	       $conn = new PDO("sqlsrv:server=SQLServer;Database=You2Me", "You2Me","You2Me2021");
               $conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
          } catch(Exception $e) {
               die( print_r( $e->getMessage() ) );
          }
    
          $formats = array();

	  // Get all Formats 
          $sql="SELECT Formats.*,FormatTypes.FormatTypeName FROM Formats JOIN FormatTypes ON FormatTypes.FormatTypeID=Formats.FormatTypeID ORDER BY FormatTypeName";

          $stmt = $conn->prepare($sql);
	       
	  try { 
	       $stmt->execute();
	  } catch(Exception $e) {
	       die("Something went wrong getting the formats with the error " . $e);
	  }
	       
	  while ($row = $stmt->fetch()) {
               $formats[] = $row;
	  }
	  
	  echo json_encode($formats);
     } 
      
     function getDownloadProgress($URL) {
          global $db_name;

          $file_db = new PDO('sqlite:' . $db_name);
          
	  if ($file_db == null)
	       return;

          $sql="SELECT id,message FROM downloadProgress WHERE URL='" . $URL . "' LIMIT 1";

          $result=$file_db->query($sql);
        
          foreach($result as $result) {
	       $file_db->exec("DELETE FROM downloadProgress WHERE id=" . $result['id'] . " LIMIT 1");
                  
               // Store message so we can close DB
               $message = $result['message'];
                  
               die(json_encode(array($message,false))); 
	  }
           
          die(json_encode(array(null,true))); 
     }
     
     function getSupportedURLs() {
          $url="http://ytdl-org.github.io/youtube-dl/supportedsites.html";
          
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

     function lastIndexOf($str,$x) {
          $index = -1;

          for ($i=0; $i < strlen($str); $i++) 
               if ($str[$i] == $x)
                    $index=$i;

          return $index;
     }

     function moveFile() {
          global $audioDestinationPath;
          global $domain;
          global $os;
          global $sourcePath;
          global $videoDestinationPath;

          $fileName=$_GET["Filename"];
  
	  $fileName=str_replace($domain,"",$fileName);

          $moveToServer=(isset($_GET["MoveToServer"]) && $_GET["MoveToServer"] == "true" ? true : false);
 
          if (isset($_GET["IsVideoFormat"]) && $_GET["IsVideoFormat"] == true) {
               // Rename the video 
               if ($moveToServer == true) {
                    $res=rename($sourcePath . $fileName,$videoDestinationPath . $fileName);
		    
		    //die("Source path=" . $sourcePath . $fileName . " and dest. path=" . $videoDestinationPath . $fileName);
 
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
     
          $artist=$_GET["Artist"];

          $artist=str_replace("'","",$artist);

          $album=(isset($_GET["Album"]) && $_GET["Album"] != "null" ? $_GET["Album"] : "Unknown");
            
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

          if ($pathBuildSucceeded)
               $audioDestinationPath=$audioDestinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album . ($os=="Windows" ? "\\" : "/");
          
          // Rename the audio file     
          $res=rename($sourcePath . $fileName,$audioDestinationPath . $fileName);
       
          if ($res==true) // Pass the download link and the local file link
               echo json_encode(array($domain . urlencode($fileName), $sourcePath . urlencode($fileName)));
          else
               echo json_encode(array("Error: An error occurred while copying the audio file to the new location"));

          return;
     }
     
     function writeID3Tags() {
          global $domain;
          global $sourcePath;
    
          $fileName = $_GET["Filename"];
          $isLastStep=(isset($_GET["IsLastStep"]) && $_GET["IsLastStep"] == "true" ? true : false);
       
          $artist=(isset($_GET["Artist"]) ? $_GET["Artist"] : "");
          $album=(isset($_GET["ALbum"]) ? $_GET["Album"] : "");
          $title=(isset($_GET["TrackName"]) ? $_GET["TrackName"] : "");
          $trackNum=(isset($_GET["TrackNum"]) ? $_GET["TrackNum"] : "");
          $genre=(isset($_GET["Genre"]) ? $_GET["Genre"] : "");
          $year=(isset($_GET["Year"]) ? $_GET["Year"] : "");

          $tagData=array();

          if ($artist != "") {
              $tagData['artist']=array($artist);
              $tagData['band']=array($artist);
          }
       
          if ($album != "")
              $tagData['album']=array($album);
          
       
          if ($title != "")
              $tagData['title']=array($title);
          
          if ($trackNum != "")
               $tagData['track']=array($trackNum);
       
          if ($genre != "")
              $tagData['genre']=array($genre);
       
          if ($year != "")
              $tagData['year']=array($year);
          
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
                    die(json_encode(array($domain . $fileName, $sourcePath . urlencode($fileName))));
               else
                    $status="Successfully wrote the ID3 tags";
          
               if (!empty($tagWriter->warnings))
                    $status .= "There were some warnings: " . implode('<br><br>', $tagWriter->warnings);
          } else
               $status="Error: Failed to write tags! " . implode('<br><br>', $tagWriter->errors);

          echo json_encode(array($status));

          return;
     }

     if (isset($_GET["DeleteDownloadFile"])) {
          if (!isset($_GET["Filename"]))
               die("Error: DownloadFile was called but not all audio arguments were provided");
         
          $fileName = $_GET["Filename"];

          // only allow the delete if the file name begins with $domain 
          if (strcmp(substr($fileName,0,strlen($domain)),$domain) !== 0) 
               die("Error: DownloadFile was called with an invalid argument");
       
          try {
               // Delete using $sourcePath
               unlink($sourcePath . substr($fileName,lastIndexOf($fileName,"/")+1));
          } catch(Exception $e) {
               die("Unable to delete the file");
          }
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

     if (isset($_GET["GetDownloadProgress"]))
          getDownloadProgress($_GET["URL"]);

     if (isset($_GET["GetAPIKey"]))
          getAPIKey();

     if (isset($_GET["GetFormats"]))
          getFormats();

     if (isset($_GET["GetThumbnail"]))
          getThumbnail($_GET["URL"]);

     if (isset($_GET["MoveFile"])) {
          if (!isset($_GET["Artist"]) || !isset($_GET["Filename"]) || !isset($_GET["MoveToServer"])) 
               $missingParams=true;
          else
                 $missingParams=false;
                 
          if ($missingParams==true)
               die("Error: MoveFile was called but not all arguments were provided");
          else
               moveFile();
     }
     
     if (isset($_GET["GetSupportedURLs"]))
          getSupportedURLs();

     if (isset($_GET["WriteID3Tags"])) {
          // Validate that the required arguments were provided
          $missingParams=false;

          if (!isset($_GET["Artist"]) || !isset($_GET["TrackName"])) 
               $missingParams=true;
          
          if ($missingParams==true)
               die("Error: WriteID3Tags was called but not all audio arguments were provided");
          else
               writeID3Tags();
     }
?>
