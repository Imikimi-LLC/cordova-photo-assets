# cordova_photo_assets
Cordova Plugin for Accessing the Photo Assets on iOS and eventually Android.

### Platforms Supported

* Supports iOS 8+ [Photos Framework](https://developer.apple.com/library/prerelease/ios/documentation/Photos/Reference/Photos_Framework/index.html#//apple_ref/doc/uid/TP40014408) (PHAsset, PHAssetCollection, and PHCollectionList)
* iOS 7 not currently supported, but is planned
* iOS <= 6 support not planned

### Features

* Currently only supports images
* List all photo collections (albums)
* Select any photo collection including those on iCloud
* Collection asset ranges
  * Each collection is a list of images ordered by date descending
  * Select subranges with ```offset``` and ```limit``` options
  * Thumbnails for all assets in the current range are automatically generated
  * Asset metadata like ```originalPixelWidth``` and ```originalPixelHeight```
* Subscribes to changes from iOS and passes updates to client via javascript events
  * Changes in the collection list
  * Changes to assets in the asset window
* Fetch individual assets up to full size and JPG quality
* Normalized image orientation (all images are properly rotated in the browser)
* Fully asynchronous and multi-threaded; Only minimal time spent on the main javascript thread.

## Examples

### Simple Example

This example will list the first 100 assets.

```coffeescript

document.addEventListener 'deviceready', ->
  PhotoAssets.setOptions currentCollectionKey: "all", limit: 100, ->
    console.log "all (local) photo assets selected, a photoAssetsChanged event will follow shortly"

document.addEventListener 'photoAssetsChanged', ({details})->
  {assets, currentCollection} = details
  {collectionName} = currentCollection

  console.log "PhotoAssets from Collection: #{collectionName}:"
  for asset in assets
    console.log "  asset #{offset++}: #{asset.assetKey}"
```

### Extended Example

This example shows how to get a list of all available collections, how to follow one specifically, and how to set all custom options.

```coffeescript

document.addEventListener 'deviceready', ->

  PhotoAssets.getCollections (assetCollections)->
    [{
      collectionKey
      collectionName
      estimatedAssetCount
    }] = assetCollections

    PhotoAssets.setOptions
      currentCollectionKey: collectionKey
      thumbnailSize: 270
      limit: 100
      offset: 0
      thumbnailQuality: 95
    , ->
      console.log "selected first asset collection: " + collectionName

document.addEventListener 'photoAssetsChanged', ({details})->
  # see previous example or API doc
```

## PhotoAssets API

#### getCollections
```coffeescript
PhotoAssets.getCollections successCallback, errorCallback

successCallback: (collections) ->
  [{collectionKey, collectionName, estimatedAssetCount}] = collections
```

Returns, via successCallback, an array of collections with the following properties each:

* collectionKey: unique identifier for the collection
  * Used to select the collection you want for thumbnails:
  * Ex: ```PhotoAssets.setOptions currentCollectionKey: collectionKey```
* collectionName: human-readable name for the collection
* estimatedAssetCount: (integer) estimated number of photos in the collection

#### setOptions
```coffeescript
PhotoAssets.setOptions
  # all options and their default values:
  currentCollectionKey: ""    # (string)
  offset:               0     # integer >= 0
  limit:                100   # integer >= 1
  thumbnailSize:        270   # maximum pixel height or width as an integer
  thumbnailQuality:     95    # Jpeg quality as an integer between 0 and 100
, successCallback, errorCallback
```

When setting options, all options are optional. Omitted options will be left untouched from their previous value.

Notes:

* Set ```currentCollectionKey``` to ```"all"``` for all local assets. Set it to ```""``` to stop all asset monitoring. To select specific collections, use ```getCollections``` to get a list of all collections and their respective ```collectionKeys```.
* ```offset``` and ```limit``` define a "range" into the full list of assets for the current selected collection. Thumbnail images are automatically generated for all assets starting at number ```offset``` through asset number ```offset + limit - 1```. Performance test your application to determine the best performing ```limit``` value.

#### getOptions
```coffeescript
PhotoAssets.getOptions successCallback, errorCallback

successCallback: (options) ->
```

Returns, via successCallback, the current value for all options as an ```options``` object.

#### getPhoto

```coffeescript
PhotoAssets.getPhoto
  assetKey:          "string" # required - see photoAssetsChanged
  maxSize:           123      # width and height <= maxSize. default: no max
  quality:           95       # 0 to 100 JPG quality. default: 95
, successCallback, errorCallback

successCallback: ({
  assetKey            # unique key for this asset
  photoUrl            # link to the app-local image file
  pixelWidth          # width of the app-local image file
  pixelHeight         # height of the app-local image file
  originalPixelWidth  # width of the original asset
  originalPixelHeight # height of the original asset
}) ->
```

This call fetches a photo given its ```assetKey```. Asset keys are provided via ```photoAssetsChanged``` events. On success, a version of the photo asset has been writen to app-local storage and is accessable via ```photoUrl```. This temporary file is unique to this call and will stick around until the next time the plugin is initialized - sometime after the next app start.

#### photoAssetsChanged event

```coffeescript
document.addEventListener 'photoAssetsChanged', ({details})->
  {
    options             # same object returned by getOptions
    collections         # same array returned by getCollections
    assets              # array of all assets in the current range with valid thumbnails
    currentCollection   # object describing the current collection
  } = details

  [{
    assetKey            # unique key for this asset
    originalPixelWidth  # width of the original asset
    originalPixelHeight # height of the original asset

    # properties which are set once the thumbnail is generated
    photoUrl            # url to fetch the thumbnail photo
    pixelWidth          # width of the thumbnail
    pixelHeight         # height of the thumbnail
  }] = assets
```

Thumbnails are generated using a thread-pool. Many ```photoAssetsChanged``` events will be fired as thumbnails are generated. Most of the data in the event is valid. Elements in the ```assets``` array may not have all their fields set until their individual thumbnails have been generated. If ```photoUrl``` is set, it points to a valid thumbnail image.

## Notes

### Temporary Files

This plugin creates temporary files in its own temporary folder. Each time the plugin is initialized, it deletes all existing temporary files. Plugin init happens on the first API call.

# Future

```
iOS supports the following additional attributes for some collections:

  startDate
  endDate
  approximateLocation
  localizedLocationNames

And the following additional asset properties:

  location, duration, favorite, hidden
```
