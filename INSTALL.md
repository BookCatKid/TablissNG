# How to Download the extension and add it to your browser

<a href="https://addons.mozilla.org/en-US/firefox/addon/tablissng/"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" height="70"></a>
<a href="https://chromewebstore.google.com/detail/tabliss-a-beautiful-new-t/dlaogejjiafeobgofajdlkkhjlignalk"><img src="https://developer.chrome.com/static/docs/webstore/branding/image/HRs9MPufa1J1h5glNhut.png" alt="Get the Extension on Chrome" height="70" style="border: 1px solid transparent; border-radius:6px;"></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/tablissng/mkaphhbkcccpgkfaifhhdfckagnkcmhm"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Get_it_from_Microsoft_Badge.svg/320px-Get_it_from_Microsoft_Badge.svg.png" alt="Get the Extension on Edge" height="70" style="border: 1px solid transparent; border-radius:4px;"></a>

**Recommended:** The best way to install TablissNG is via the official browser stores (Chrome Web Store, Firefox Add-ons, or the Edge Add-On store) because they provide automatic updates and make installation easy.

## Step 1: Download the Extension

### Option 1: Download from GitHub Releases (Recommended)

1. **Go to the [Releases page](https://github.com/BookCatKid/TablissNG/releases)** of the repository
2. Find the latest release. For the absolute latest development builds, prefer the Nightly release (tag `nightly-auto`). If you need stability, use the latest stable release instead.
3. Download the appropriate file: (for Nightly builds, the filenames will include `-nightly` or `tablissng-X.X.X.X.xpi` for Firefox)
   - For Firefox (Nightly): `tablissng-1.6.1.1.xpi`
   - For Firefox (Stable): `tabliss-firefox-signed.xpi` (This file may not exist)
   - For Chrome/Chromium: `tabliss-chromium.zip`
   - For Firefox (unsigned version): `tabliss-firefox.zip` (expert)
   - For Safari (unsigned version): `tabliss-safari.zip` (expert)

### Option 2: Download Nightly Builds from GitHub Actions

1. **Go to the Actions tab** of the repository on GitHub.
2. Click on the latest workflow with a green checkmark.
3. Scroll down to the **Artifacts** section.
4. Click on the `.zip` file to download the extension.

**Note:** If you can't download the artifacts, you may not be logged into GitHub. You can either:

- Log in to GitHub and try again
- Visit [nightly.link](https://nightly.link) and paste the artifact link there

## Step 2: Install the Extension in Your Browser

#### Firefox

1. Go to `about:addons`
2. Click the gear icon
3. Click "Install Add-on from File"
4. Select the .zip or .xpi file you downloaded

#### Chromium

1. Unzip the .zip file into a folder
2. Go to `chrome://extensions/`
3. Enable developer mode
4. Click Load Unpacked
5. Select the folder you unzipped to. (make sure it has manifest.json in the root)

#### Safari

For now the only way to install the safari extension is to install developer mode and install the unsigned version. I am not able to put it on the app store because to do that I would have to buy the **Apple Developer Licence** that costs **$99** a year!

1. Unzip the downloaded zip file into a folder
2. Enable Safari's Develop menu: Safari > Settings (Preferences) > Advanced → check `Show features for web developers`
3. Go to the now visible `Develop` tab and click `Add temporary extension...`
4. Select the folder you unzipped. (make sure it has manifest.json in the root)
5. You should be brought to the `Extensions` tab and now click on the checkbox next to extension to enable it.
6. Click `Use for new windows and tabs` to allow TablissNG to overide your new tab page. (If its not working select TablissNG for the two `New * open with` options)


## Notes

- If you need extra help just create an issue and I will help.

---

Now your browser extension should be up and running!
