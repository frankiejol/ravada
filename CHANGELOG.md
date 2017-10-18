# Change Log


**Implemented enhancements:**

- Show information about downloading ISO [\#185]
- Create new machine from ISO [\#138]
- Add graphics options in VM settings [\#260]
- Add a description associated with the machine [\#275]
- Improve show clones in admin [\#279]
- Running development release [\#281]
- Add Windows' definitions for new machines [\#289]
- Give feedback on rename machine [\#291]
- Copy spice password to clipboard [\#300]
- API for opening a Virtual Machine [\#306]
- Disable running Base [\#327]
- Add Indonesia translation [\#372]
- Updated french translation [\#399]

**Fixed bugs:**

- KVM domains start when creating base [\#271]
- Swap volume should not be mandatory [\#278]
- Allow dot, underscore and dash in the username [\#311]
- Check for duplicate machine name on copy [\#313]
- Wait for prepare base before create vm [\#314]
- rvd services start before mysql [\#321]
- Download Debian stretch iso fails [\#326]
- Warn of libvirt network missing [\#343]
- Xubuntu ISO files conflict [\#335]
- Fix duplicate msgid in en.po [\#367]
- rvd_back fails the first time on fresh installs [\#383]
- Error creating Windows machine [\#390]
- Changing password doesn't work [\#395]