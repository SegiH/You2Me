<?php
     // Required binaries: youtube-dl, id3v2, 
     require_once('getid3/getid3.php');
     require_once('getid3/write.php');
  
     // The path where the song will be moved to. Make sure the path has a slash at the end
     $destinationPath="/mnt/usb/";
     $sourcePath="/var/www/html/media/";
     $domain="https://segi.mooo.com/media/";

     //$os=php_uname("s");
     $os=(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? "Windows" : "Unix");
     
     if (!isset($_GET["step"])) {
          die("Step not provided");
     }
     
     // This script is called multiple times using Ajax requests
     switch($_GET["step"]) {
          case "1": // Download the song
               // Execute the script that downloads the song and returns the mp3 file name
	       if ($os=='Unix') 	  
	            $cmd="youtube-dl " .  htmlspecialchars($_GET["URL"]) . " -x --audio-format mp3 --audio-quality 320 | grep Destination: | grep mp3 2>&1";
	       else
	            $cmd="youtube-dl " .  htmlspecialchars($_GET["URL"]) . " -x --audio-format mp3 --audio-quality 320 | find \"Destination:\" | find \"mp3\" 2>&1";

	       exec($cmd,$retArr,$retVal);

               // If its set to something, set it back
               //if ($currLDLibraryPath != false) {
               //     putenv("LD_LIBRARY_PATH",$currLDLibraryPath);
               //}

               // Parse the output for the file name 
	       foreach ($retArr as $key => $value) {
                    if (strpos($value,"ffmpeg") != false) {
                         $mp3File=$value;
                    } 
               }

               if (!isset($mp3File)) {
                    echo json_encode(array("ERROR: Unable to fetch the MP3"));
                    return;
               } 
            
               $pos=strpos($mp3File,"[ffmpeg] Destination:");

               if ($pos===0) {
                    $mp3File=substr($mp3File,$pos+strlen("[ffmpeg] Destination: "));             
               }
               
	       if (!chmod($mp3File,0777)) {
		    echo "Failed to set file mode";
	       }
 
               /*
               $cmd2="../python/aidmatch.py " . $mp3File . " 2>&1";

	       exec($cmd2,$retArr2,$retVal2);

               $tagged=false;

	       # Since we only care about the first result, we only save the first key value pair
	       foreach ($retArr2 as $key => $value) {
		    if ($value=="fingerprint could not be calculated")
                         break;
          
                    $tagged=true;
 
                    $tags=$value;

	            $tags=explode(',',$tags);

	            $artist=str_replace('"','',$tags[0]);

	            $title=str_replace('"','',$tags[1]);

    	            # write the tags
	            $cmd3="id3v2 -t \"" . $title . "\" -a \"" . $artist . "\" " . $mp3File;
	       
	            exec($cmd3,$retArr3,$retVal3);

	            # if retval is 0 then command was successful
	            if ($retVal3 == 0) {
	                 echo json_encode(array($mp3File,$artist,$title));
	            }
		    break;   
               }


	       # if tagged is false, nothing was written above
	       if ($tagged == false)
	            echo json_encode(array($mp3File,"",""));
	       */

	       echo json_encode(array($mp3File));

               return;
          case 2: // Write the ID3 Tags
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

               // Create the new file name based on Artist Track number (if given) Track Name.mp3
               $newFileName=htmlspecialchars($tracknum != "" ? $tracknum . " " : "") . htmlspecialchars($_GET["TrackName"]) . ".mp3";

               // Rename the file
               if (rename(htmlspecialchars($_GET["Filename"]),$sourcePath . $newFileName) == false) {
                    echo json_encode(array("Unable to rename the file " . htmlspecialchars($_GET["Filename"]) . " to " . $sourcePath . $newFileName));
	       } else {
		    $steps=$_GET["StepCount"];
                    
		    // If this is the last step include the domain 
		    if ($steps==4) {
		         echo json_encode(array($domain . basename($newFileName)));
		    } else {
		         echo json_encode(array(basename($newFileName)));
		    }
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
