<?php
     // Required binaries: youtube-dl, id3v2, 
     require_once('getid3/getid3.php');
     require_once('getid3/write.php');
  
     // The path where the song will be moved to. Make sure the path has a slash at the end
     $destinationPath="/mnt/usb/";
     $sourcePath="/var/www/html/media/";
     $domain="https://yoursite.com/media/";

     //$os=php_uname("s");
     $os=(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? "Windows" : "Unix");
     
     if (isset($_GET["DeleteFile"]) && isset($_GET["Filename"])) {
          unlink($sourcePath . htmlspecialchars($_GET["Filename"]));
          die("OK");
     }

     if (!isset($_GET["step"])) {
          die("Step not provided");
     }
     
     // This script is called multiple times using Ajax requests
     switch($_GET["step"]) {
          case "1": // Download the song
               // $bitrate = (isset($_GET["Bitrate"]) ? htmlspecialchars($_GET["Bitrate"]) : (htmlspecialchars($_GET["AudioFormat"])=="mp3" ? '320k' : ''));
               $bitrate = (isset($_GET["Bitrate"]) ? htmlspecialchars($_GET["Bitrate"]) : '320k');

               // Build command that will download the song and returns the audio file name
	       // $cmd="youtube-dl " .  htmlspecialchars($_GET["URL"]) . " -x --audio-format " . htmlspecialchars($_GET["AudioFormat"]) . " --audio-quality " . $bitrate;
	       $cmd="youtube-dl " .  htmlspecialchars($_GET["URL"]) . " -x --audio-format mp3 --audio-quality " . $bitrate;

	       
               if ($os=='Unix') 	  
	            // $cmd.=" | grep Destination: | grep " . htmlspecialchars($_GET["AudioFormat"]) . " 2>&1";
	            $cmd.=" | grep Destination: | grep mp3 2>&1";
	       else
	            // $cmd.=" | find \"Destination:\" | find \"" . htmlspecialchars($_GET["AudioFormat"]) . "\" 2>&1";
	            $cmd.=" | find \"Destination:\" | find \"mp3\" 2>&1";

	       exec($cmd,$retArr,$retVal);

               // If its set to something, set it back
               //if ($currLDLibraryPath != false) {
               //     putenv("LD_LIBRARY_PATH",$currLDLibraryPath);
               //}

               // Parse the output for the file name 
	       foreach ($retArr as $key => $value) {

                    if (strpos($value,"Destination:") != false) {
                         $audioFile=$value;
                    } 
               }

               if (!isset($audioFile)) {
                    echo json_encode(array("ERROR: Unable to fetch the track"));
                    return;
               } 
            
               $pos=strpos($audioFile,"[ffmpeg] Destination:");

               if ($pos===0) {
                    $audioFile=substr($audioFile,$pos+strlen("[ffmpeg] Destination: "));             
               }

               $pos=strpos($audioFile,"[download] Destination: ");

               if ($pos !== false) {
                    $audioFile=substr($audioFile,$pos+strlen("[download] Destination: "));             
               }
               
	       if (!chmod($audioFile,0777)) {
		    echo "Failed to set file mode";
	       }
 
               $cmd2="../python/aidmatch.py " . $audioFile . " 2>&1";

	       exec($cmd2,$retArr2,$retVal2);

               $tagged=false;

	       $artist = "";
	       $title = "";

	       # Since we only care about the first result, we only save the first key value pair
	       foreach ($retArr2 as $key => $value) {
		    if ($value=="fingerprint could not be calculated")
                         break;
          
                    $tagged=true;
 
                    $tags=$value;

	            $tags=explode(',',$tags);
	            $artist=str_replace('"','',$tags[0]);

	            $title=str_replace('"','',$tags[1]);

		    break;   
	       }


	       # if tagged is false, nothing was written above
	       if ($tagged == false)
	            echo json_encode(array($audioFile,"",""));
               else 
	            echo json_encode(array($audioFile,$artist,$title));
	       // echo json_encode(array($audioFile));

               return;
          case 2: // Write the ID3 Tags
               /*if (htmlspecialchars($_GET["AudioFormat"]) != "mp3") {
                    echo json_encode(array("No tags need to be written"));
                    return;
               }*/

               $tagData = array(
                    'artist'   => array(htmlspecialchars($_GET["Artist"])),
                    'band'     => array(htmlspecialchars($_GET["Artist"])), // album artist
                    'album'    => array(htmlspecialchars($_GET["Album"])),
                    'title'    => array(htmlspecialchars($_GET["TrackName"])),
                    'track'    => array(htmlspecialchars($_GET["TrackNum"])),
                    'genre'    => array(htmlspecialchars($_GET["Genre"])),
                    'year'     => array(htmlspecialchars($_GET["Year"]))
               );
   
               // id3 object 
               $getID3=new getID3;
               $getID3->setOption(array('encoding'=>'UTF-8'));

               $tagWriter = new getid3_writetags;
               
               // Tag writer options
               $tagWriter->filename = htmlspecialchars($_GET["Filename"]);
               $tagWriter->tagformats = array('id3v1','id3v2.3');
               $tagWriter->overwrite_tags    = true; 
               $tagWriter->remove_other_tags = false; 
               $tagWriter->tag_encoding      = 'UTF-8';
               $tagWriter->tag_data = $tagData;
              
               $status="";

               // write tags
               if ($tagWriter->WriteTags()) {
     	            $status="Successfully wrote the ID3 tags";
	      
                    if (!empty($tagWriter->warnings)) {
	                 $status .= "There were some warnings: " . implode('<br><br>', $tagWriter->warnings);
    	            }
               } else {
                    $status="ERROR: Failed to write tags! " . implode('<br><br>', $tagWriter->errors);
               }
              
               echo json_encode(array($status));
               return;
          case 3: // Rename the file
               $tracknum="";

               // If the track num was provided, pad it with a leading 0
               if ($_GET["TrackNum"] != "") { 
                    if ($_GET["TrackNum"] < 10) {
                         $tracknum="0" . htmlspecialchars($_GET["TrackNum"]);
                    } else {
                         $tracknum=htmlspecialchars($_GET["TrackNum"]);
                    }
               }

               // $ext=(strlen(htmlspecialchars($_GET["AudioFormat"])) ? htmlspecialchars($_GET["AudioFormat"]) : "mp3");
               $ext="mp3";

               // Create the new file name based on Artist Track number (if given) Track Name.Extension
               $newFileName=htmlspecialchars($tracknum != "" ? $tracknum . " " : "") . htmlspecialchars($_GET["TrackName"]) . "." . $ext;

               // Rename the file
               if (rename(htmlspecialchars($_GET["Filename"]),$sourcePath . $newFileName) == false) {
                    echo json_encode(array("Unable to rename the file " . htmlspecialchars($_GET["Filename"]) . " to " . $sourcePath . $newFileName));
	       } else {
		    $steps=$_GET["StepCount"];
                    
		    // If this is the last step include the domain 
		    // if ($steps==4) {
		         echo json_encode(array($domain . basename($newFileName),basename($newFileName)    ));
		    // } else {
		    //      echo json_encode(array(basename($newFileName)));
		    // }
               }
             
               return;
          case 4: // Move file new location
               $artist=htmlspecialchars($_GET["Artist"]);
               $artist=str_replace("'","",$artist);

               $album=htmlspecialchars($_GET["Album"]);
               $pathBuildSucceeded=false;

               // Try to build path if it exists 
	       if ($artist != null && $artist != "" && $album != null && $album != "") {
                    if (file_exists($destinationPath . $artist)==false) {
                         if (mkdir($destinationPath . $artist)) {
                              if (!file_exists($destinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
                                   if (mkdir($destinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
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
                         if (!file_exists($destinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
                              if (mkdir($destinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album)) {
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
                    $destinationPath=$destinationPath . $artist . ($os=="Windows" ? "\\" : "/") . $album . ($os=="Windows" ? "\\" : "/");
               }
               
	       $fileName=htmlspecialchars($_GET["Filename"]);

               $res=rename($sourcePath . $fileName,$destinationPath . $fileName);
               
               if ($res==true) {
                    echo json_encode(array("The file has been moved to the new location"));
               } else {
                    echo json_encode(array("ERROR: An error occurred while copying the file to the new location"));
	       }

               return;
}
?>
