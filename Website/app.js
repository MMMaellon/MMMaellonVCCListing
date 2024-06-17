import { baseLayerLuminance, StandardLuminance } from 'https://unpkg.com/@fluentui/web-components';

const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
    description: "{{ if package.Description; package.Description; end; }}",
    version: "{{ package.Version }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

const setTheme = () => {
  const isDarkTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkTheme()) {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.DarkMode);
  } else {
    baseLayerLuminance.setValueFor(document.documentElement, StandardLuminance.LightMode);
  }
}

(() => {
  setTheme();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    setTheme();
  });

  const packageGrid = document.getElementById('packageGrid');

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', ({ target: { value = '' }}) => {
    const items = packageGrid.querySelectorAll('fluent-data-grid-row[row-type="default"]');
    items.forEach(item => {
      if (value === '') {
        item.style.display = 'grid';
        return;
      }
      if (
        item.dataset?.packageName?.toLowerCase()?.includes(value.toLowerCase()) ||
        item.dataset?.packageId?.toLowerCase()?.includes(value.toLowerCase())
      ) {
        item.style.display = 'grid';
      } else {
        item.style.display = 'none';
      }
    });
  });

  const urlBarHelpButton = document.getElementById('urlBarHelp');
  const addListingToVccHelp = document.getElementById('addListingToVccHelp');
  urlBarHelpButton.addEventListener('click', () => {
    addListingToVccHelp.hidden = false;
  });
  const addListingToVccHelpClose = document.getElementById('addListingToVccHelpClose');
  addListingToVccHelpClose.addEventListener('click', () => {
    addListingToVccHelp.hidden = true;
  });

  const closeHelpModal = e => {
    if (e.target != addListingToVccHelp && e.target != addListingToVccHelpClose) return;
    addListingToVccHelp.hidden = true;
    e.stopPropagation();
  }
  addListingToVccHelpClose.addEventListener('click', closeHelpModal);
  addListingToVccHelp.addEventListener('click', closeHelpModal);

  const vccListingInfoUrlFieldCopy = document.getElementById('vccListingInfoUrlFieldCopy');
  vccListingInfoUrlFieldCopy.addEventListener('click', () => {
    const vccUrlField = document.getElementById('vccListingInfoUrlField');
    vccUrlField.select();
    navigator.clipboard.writeText(vccUrlField.value);
    vccUrlFieldCopy.appearance = 'accent';
    setTimeout(() => {
      vccUrlFieldCopy.appearance = 'neutral';
    }, 1000);
  });

  const vccAddRepoButton = document.getElementById('vccAddRepoButton');
  vccAddRepoButton.addEventListener('click', () => window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`));

  const vccUrlFieldCopy = document.getElementById('vccUrlFieldCopy');
  vccUrlFieldCopy.addEventListener('click', () => {
    const vccUrlField = document.getElementById('vccUrlField');
    vccUrlField.select();
    navigator.clipboard.writeText(vccUrlField.value);
    vccUrlFieldCopy.appearance = 'accent';
    setTimeout(() => {
      vccUrlFieldCopy.appearance = 'neutral';
    }, 1000);
  });

  const rowMoreMenu = document.getElementById('rowMoreMenu');
  const hideRowMoreMenu = e => {
    if (rowMoreMenu.contains(e.target) || e.target.classList.contains('rowMenuButton') || rowMoreMenu.hidden) return;
    document.removeEventListener('click', hideRowMoreMenu);
    cardContainer.removeEventListener('click', hideRowMoreMenu);
    rowMoreMenu.hidden = true;
  }
  const cardContainer = document.getElementById('card');
  const rowMenuButtons = document.querySelectorAll('.rowMenuButton');
  let currentPackageUrl;

  const downloadLink = document.querySelector('#rowMoreMenuDownload');
  const downloadListener = () => {
    if (currentPackageUrl) {
      window.open(currentPackageUrl, '_blank');
    }
  };
  if(downloadLink)
  {
    downloadLink.addEventListener('click', downloadListener);
  }

  // const githubLink = document.querySelector("#rowMoreMenuGithub");
  // const githubListener = () => {
  //   if (currentPackageUrl) {
  //     const regex = /^(https:\/\/github\.com\/[^/]+\/[^/]+\/)releases\/download\/[^/]+\/[^/]+$/;
  //     const match = currentPackageUrl.match(regex);
  //     window.open(match[1], '_blank');
  //   }
  // };
  // githubLink.addEventListener('click', githubListener);

  rowMenuButtons.forEach(button => {
    button.addEventListener('click', e => {
      rowMoreMenu.style.top = `${e.clientY + e.target.clientHeight}px`;
      rowMoreMenu.style.left = `${e.clientX - 120}px`;
      rowMoreMenu.hidden = false;

      console.log(e.target);
      console.log(e?.target?.dataset?.packageUrl);
      
      currentPackageUrl = e.target.dataset.packageUrl;

      setTimeout(() => {
        document.addEventListener('click', hideRowMoreMenu);
        cardContainer.addEventListener('click', hideRowMoreMenu);
      }, 1);
    });
  });

  const packageInfoModal = document.getElementById('packageInfoModal');
  const packageInfoModalClose = document.getElementById('packageInfoModalClose');
  const closeInfoModal = e => {
    if (e.target != packageInfoModal && e.target != packageInfoModalClose) return;
    packageInfoModal.hidden = true;
    e.stopPropagation();
  }
  packageInfoModalClose.addEventListener('click', closeInfoModal);
  packageInfoModal.addEventListener('click', closeInfoModal);

  // Fluent dialogs use nested shadow-rooted elements, so we need to use JS to style them
  const modalControl = packageInfoModal.shadowRoot.querySelector('.control');
  modalControl.style.maxHeight = "90%";
  modalControl.style.transition = 'height 0.2s ease-in-out';
  modalControl.style.overflowY = 'hidden';

  const packageInfoName = document.getElementById('packageInfoName');
  const packageInfoId = document.getElementById('packageInfoId');
  const packageInfoVersion = document.getElementById('packageInfoVersion');
  const packageInfoDescription = document.getElementById('packageInfoDescription');
  const packageInfoAuthor = document.getElementById('packageInfoAuthor');
  const packageInfoDependencies = document.getElementById('packageInfoDependencies');
  const packageInfoKeywords = document.getElementById('packageInfoKeywords');
  const packageInfoLicense = document.getElementById('packageInfoLicense');
  const packageInfoExternalLink = document.getElementById('packageInfoExternalLink');
  const packageInfoVccUrlField = document.getElementById('packageInfoVccUrlField');

  const rowAddToVccButtons = document.querySelectorAll('.rowAddToVccButton');
  rowAddToVccButtons.forEach((button) => {
      if(match)
      {
        button.addEventListener('click', e => {
      const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/[^/]+\/[^/]+$/;
      const match = e.target.dataset?.packageUrl.match(regex);
        window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent("http://" + match[1] + ".github.io/" + match[2] + "/index.json")}`)
        });
      }
  });
  const rowPackageGithubButton = document.querySelectorAll('.rowAddToVccButton');
  rowPackageGithubButton.forEach((button) => {
    button.addEventListener('click', e => {
      const regex = /^(https:\/\/github\.com\/[^/]+\/[^/]+\/)releases\/download\/[^/]+\/[^/]+$/;
      const match = e.target.dataset?.packageUrl.match(regex);
      if(match)
      {
       window.open(match[1], '_blank');
      }
    });
  });
  const rowPackageInfoButton = document.querySelectorAll('.rowPackageInfoButton');
  rowPackageInfoButton.forEach((button) => {
    button.addEventListener('click', e => {
      const packageId = e.target.dataset?.packageId;
      const packageInfo = PACKAGES?.[packageId];
      if (!packageInfo) {
        console.error(`Did not find package ${packageId}. Packages available:`, PACKAGES);
        return;
      }

      packageInfoName.textContent = packageInfo.displayName;
      packageInfoId.textContent = packageId;
      packageInfoVersion.textContent = `v${packageInfo.version}`;
      packageInfoDescription.textContent = packageInfo.description;
      packageInfoAuthor.textContent = packageInfo.author.name;
      packageInfoAuthor.href = packageInfo.author.url;
      const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/[^/]+\/[^/]+$/;
      const match = e.target.dataset?.packageUrl.match(regex);
      if(match)
      {
        packageInfoExternalLink.href = "http://" + match[1] + ".github.io/" + match[2];
        packageInfoExternalLink.textContent = "http://" + match[1] + ".github.io/" + match[2];
        packageInfoVccUrlField.value = "http://" + match[1] + ".github.io/" + match[2] + "/index.json";
      } else {
        packageInfoExternalLink.parentElement.classList.add('hidden');
        packageInfoVccUrlField.value = "Not Available";
      }

      if ((packageInfo.keywords?.length ?? 0) === 0) {
        packageInfoKeywords.parentElement.classList.add('hidden');
      } else {
        packageInfoKeywords.parentElement.classList.remove('hidden');
        packageInfoKeywords.innerHTML = null;
        packageInfo.keywords.forEach(keyword => {
          const keywordDiv = document.createElement('div');
          keywordDiv.classList.add('me-2', 'mb-2', 'badge');
          keywordDiv.textContent = keyword;
          packageInfoKeywords.appendChild(keywordDiv);
        });
      }

      if (!packageInfo.license?.length && !packageInfo.licensesUrl?.length) {
        packageInfoLicense.parentElement.classList.add('hidden');
      } else {
        packageInfoLicense.parentElement.classList.remove('hidden');
        packageInfoLicense.textContent = packageInfo.license ?? 'See License';
        packageInfoLicense.href = packageInfo.licensesUrl ?? '#';
      }

      packageInfoDependencies.innerHTML = null;
      Object.entries(packageInfo.dependencies).forEach(([name, version]) => {
        const depRow = document.createElement('li');
        depRow.classList.add('mb-2');
        depRow.textContent = `${name} @ v${version}`;
        packageInfoDependencies.appendChild(depRow);
      });

      packageInfoModal.hidden = false;

      requestAnimationFrame(() => {
        const height = packageInfoModal.querySelector('.col').clientHeight;
        modalControl.style.setProperty('--dialog-height', `${height + 14}px`);
      });
    });
  });

  const packageInfoVccUrlFieldCopy = document.getElementById('packageInfoVccUrlFieldCopy');
  packageInfoVccUrlFieldCopy.addEventListener('click', () => {
    const vccUrlField = document.getElementById('packageInfoVccUrlField');
    vccUrlField.select();
    navigator.clipboard.writeText(vccUrlField.value);
    vccUrlFieldCopy.appearance = 'accent';
    setTimeout(() => {
      vccUrlFieldCopy.appearance = 'neutral';
    }, 1000);
  });

  const packageInfoListingHelp = document.getElementById('packageInfoListingHelp');
  packageInfoListingHelp.addEventListener('click', () => {
    addListingToVccHelp.hidden = false;
  });
})();
