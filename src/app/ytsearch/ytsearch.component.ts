import { Component, OnInit } from '@angular/core';
import { DataService } from '../core/data.service';
import { Injectable } from '@angular/core';

// https://itnext.io/a-loader-for-your-components-with-angular-cdk-overlay-ebf5a4962e4d
@Component({
     selector: 'app-ytsearch',
     templateUrl: './ytsearch.component.html',
     styleUrls: ['./ytsearch.component.css']
})
@Injectable({
     providedIn: 'root'
})
export class YTSearchComponent implements OnInit {  
     searchResults : any;
     searchTerm: string = "";
     
     constructor(public dataService: DataService) { }

     ngOnInit(): void { }

     ngOnDestroy(): void { }

     addSearchResult(currSearchResult) {
          this.dataService.addLink("https://www.youtube.com/watch?v=" + currSearchResult.id.videoId, "320k");          

         // remove current item from search results
         this.searchResults = this.searchResults.filter(result => result.id.videoId != currSearchResult.id.videoId);
     }

     deleteSearchResultsButtonClick() {
          this.searchTerm=null;
          this.searchResults=null;

          this.dataService.YTSearchOverlayRef.detach();
     }

     handleYouTubeSearchKeyUp(e) { // Submit YT search when enter is pressed in search field
          if (e.keyCode === 13) // Submit when enter is pressed
               this.searchYTClick();
     }     

     searchYTClick() {
          if (this.searchTerm == "") {
               this.dataService.showSnackBarMessage("Please enter the search term");
               return;
          }

          // Do not call YT API when debugging or you'll hit the daily limit very quickly
          if (this.dataService.debugging) {
               this.searchResults=[
               {
                   "kind": "youtube#searchResult",
                   "etag": "gkReAAD4IdpTiKzJY2LwKc_FjDA",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "dyQJH615KwA"
                   },
                   "snippet": {
                       "publishedAt": "2012-09-29T18:09:04Z",
                       "channelId": "UC2hu_UEIwg47FDaVnhReVtw",
                       "title": "Buckethead - One of the best, most emotional versions of Soothsayer Live @ Gothic 9-28-2012",
                       "description": "Front row with great audio and great view that gets better towards the end.",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/dyQJH615KwA/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/dyQJH615KwA/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/dyQJH615KwA/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Bill",
                       "liveBroadcastContent": "none",
                       "publishTime": "2012-09-29T18:09:04Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "DsxcLTIu3YbcVqK7BH3SpprXDQA",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "adV8-_hgL4g"
                   },
                   "snippet": {
                       "publishedAt": "2007-10-28T17:51:26Z",
                       "channelId": "UCXIg4Htz3yq7l9AVJyxf2bw",
                       "title": "Buckethead - Soothsayer",
                       "description": "Track #6 on the album Crime Slunk Scene by Buckethead.",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/adV8-_hgL4g/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/adV8-_hgL4g/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/adV8-_hgL4g/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "lounaslaatikko",
                       "liveBroadcastContent": "none",
                       "publishTime": "2007-10-28T17:51:26Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "UjFwmlsm2Bf5vikJJnt6RkSgy6o",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "NrO0YPQcI14"
                   },
                   "snippet": {
                       "publishedAt": "2017-05-19T03:00:54Z",
                       "channelId": "UC8fqt_PDhDDszL5Zi8EauqA",
                       "title": "Buckethead - Relaxing Mix",
                       "description": "This mix is some of my favorites of Buckethead's more relaxing tunes: 1: The Flooding Of Pain 0:00 (pike #32 Rise Of The Blue Lotus track 02) 2: Pike 78 Track ...",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/NrO0YPQcI14/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/NrO0YPQcI14/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/NrO0YPQcI14/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Terminal Passage",
                       "liveBroadcastContent": "none",
                       "publishTime": "2017-05-19T03:00:54Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "6TrTPf8ynwFmYdOqP8NLXShSizI",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "n4bply6Ibqw"
                   },
                   "snippet": {
                       "publishedAt": "2016-09-27T04:50:53Z",
                       "channelId": "UCHnAYLrjeNgPbCxtLi6AcLA",
                       "title": "Buckethead - 09.24.16 - Ardmore Music Hall - 4K - Full Set",
                       "description": "0:00 - Intro 1:33 - Welcome to Bucketheadland 5:04 - Redeem Team 10:12 - Mad Monster Party 13:43 - Flare 20:57 - King James 24:56 - Jowls 29:19 - Siege ...",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/n4bply6Ibqw/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/n4bply6Ibqw/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/n4bply6Ibqw/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Chris Cafiero",
                       "liveBroadcastContent": "none",
                       "publishTime": "2016-09-27T04:50:53Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "Qq9ey-K1LABRczdU28LPpvVD0xo",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "E5PXYehriYY"
                   },
                   "snippet": {
                       "publishedAt": "2014-06-26T21:37:14Z",
                       "channelId": "UCBbv5enHgikfCgDvvQxfAMg",
                       "title": "Buckethead Pike 65 - Hold Me Forever (In memory of my mom Nancy York Carroll)",
                       "description": "Buy this album, for support of Buckethead ! http://www.bucketheadpikes.com/pike_65.html.",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/E5PXYehriYY/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/E5PXYehriYY/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/E5PXYehriYY/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Zoran Lozanoski",
                       "liveBroadcastContent": "none",
                       "publishTime": "2014-06-26T21:37:14Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "y06CHGUz9kC1134_aHnkg8SPnUs",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "4RgQ-JDiOic"
                   },
                   "snippet": {
                       "publishedAt": "2012-05-24T07:20:12Z",
                       "channelId": "UCNeK9z5NeOOEW_vzHsvcNyQ",
                       "title": "Buckethead - Aunt Suzie",
                       "description": "",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/4RgQ-JDiOic/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/4RgQ-JDiOic/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/4RgQ-JDiOic/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "JPetAreS",
                       "liveBroadcastContent": "none",
                       "publishTime": "2012-05-24T07:20:12Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "n3JWylO9oPaRJ5ILIEJS9wSVr9o",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "86GJgvF8rP8"
                   },
                   "snippet": {
                       "publishedAt": "2020-11-30T05:36:25Z",
                       "channelId": "UCyaqzhb9KcQk497fDp4WkJw",
                       "title": "(Full Album) Buckethead - Through the Looking Garden (Buckethead Pikes #284)",
                       "description": "Through the Looking Garden - Full Album 1. Through the Looking Garden 0:00 *Released on November 28, 2020 Buy it: ...",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/86GJgvF8rP8/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/86GJgvF8rP8/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/86GJgvF8rP8/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Polipoli8",
                       "liveBroadcastContent": "none",
                       "publishTime": "2020-11-30T05:36:25Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "9v9iKsJKNqdIrTV-DWjfRkRDeYA",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "MEDB4xJsXVo"
                   },
                   "snippet": {
                       "publishedAt": "2008-01-13T23:31:39Z",
                       "channelId": "UCGbwarBv3qdsfB7ol6rMyIw",
                       "title": "Buckethead with Claypool Bernie Worrell and Brain",
                       "description": "Colonel Claypool's Bucket of Bernie Brains at Bonnaroo 2002 the best!!!!",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/MEDB4xJsXVo/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/MEDB4xJsXVo/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/MEDB4xJsXVo/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Tim Beck",
                       "liveBroadcastContent": "none",
                       "publishTime": "2008-01-13T23:31:39Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "iJoitIhOfXpJnVuVUyiu6VSVeBw",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "gaHpM6GEwIg"
                   },
                   "snippet": {
                       "publishedAt": "2013-02-09T17:26:10Z",
                       "channelId": "UCyaqzhb9KcQk497fDp4WkJw",
                       "title": "(Full Album) Buckethead - Electric Sea",
                       "description": "Electric Sea - Full Album 1. Electric Sea 0:00 2. Beyond the Knowing 6:25 3. Swomee Swan 10:19 4. Point Doom 15:04 5. El Indio 20:23 6. La Wally 27:39 7.",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/gaHpM6GEwIg/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/gaHpM6GEwIg/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/gaHpM6GEwIg/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Polipoli8",
                       "liveBroadcastContent": "none",
                       "publishTime": "2013-02-09T17:26:10Z"
                   }
               },
               {
                   "kind": "youtube#searchResult",
                   "etag": "g6_k051qOVDanDc6YS1OP376720",
                   "id": {
                       "kind": "youtube#video",
                       "videoId": "H3ieFsv_EZM"
                   },
                   "snippet": {
                       "publishedAt": "2019-05-21T14:00:04Z",
                       "channelId": "UCVJOhLYPKzof5MSZGA9h7ZQ",
                       "title": "Guns N&#39; Roses Slash Talks About Buckethead &amp; His Thoughts on His Playing",
                       "description": "gunsnroses #axlrose #slash #duffmckagan #izzystradlin #2019 #newalbum For the latest Guns N' Roses latest news check out our blog: www.gnrcentral.com ...",
                       "thumbnails": {
                           "default": {
                               "url": "https://i.ytimg.com/vi/H3ieFsv_EZM/default.jpg",
                               "width": 120,
                               "height": 90
                           },
                           "medium": {
                               "url": "https://i.ytimg.com/vi/H3ieFsv_EZM/mqdefault.jpg",
                               "width": 320,
                               "height": 180
                           },
                           "high": {
                               "url": "https://i.ytimg.com/vi/H3ieFsv_EZM/hqdefault.jpg",
                               "width": 480,
                               "height": 360
                           }
                       },
                       "channelTitle": "Guns N' Roses Central",
                       "liveBroadcastContent": "none",
                       "publishTime": "2019-05-21T14:00:04Z"
                   }
               }];
          } else {
               // Call data service to download the file
               this.dataService.searchVideos(this.searchTerm)
               .subscribe((response) => {
                    this.searchResults=response.items;
               },
               error => {
                    this.dataService.showSnackBarMessage("An error occurred searching YouTube");            
               });
          }
     }
}