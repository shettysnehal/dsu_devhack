// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract UploadFactory {
    // Struct to store upload address and name
    struct UploadInfo {
        address uploadAddress;
        string name;
    }

    // Mapping from uploader address to an array of UploadInfo structs
    mapping(address => UploadInfo[]) public uploadsByUploader;

    // Mapping from address to email
    mapping(address => string) public emailByAddress;

    // Mapping from email to OTP (One-Time Password)
    mapping(string => uint256) public otpByEmail;

    // Function to create a new Upload contract
    function createUpload(
        string memory cid,
        string memory date,
        uint256 year,
        
        string memory name
    ) public {
        // Create a new Upload contract
        Upload newUpload = new Upload(cid, date, year,msg.sender, name);

        // Add the new UploadInfo struct to the array for the uploader
        uploadsByUploader[msg.sender].push(UploadInfo({
            uploadAddress: address(newUpload),
            name: name
        }));
    }

    // Function to set the email for the sender's address
    function setEmail(string memory email) public {
        emailByAddress[msg.sender] = email;
    }

    // Function to get the email associated with an address
    function getEmail(address user) public view returns (string memory) {
        return emailByAddress[user];
    }

    // Function to set the OTP for an email
    function setOtpForEmail(string memory email, uint256 otp) public {
        otpByEmail[email] = otp;
    }

    // Function to get the OTP for an email
    function getOtpForEmail(string memory email) public view returns (uint256) {
        return otpByEmail[email];
    }

    // Function to get the list of UploadInfo structs for a specific uploader
    function getUploadsByUploader(address uploader) public view returns (UploadInfo[] memory) {
        return uploadsByUploader[uploader];
    }
}
contract Upload {
    // Private Content Identifier (CID)
    string private cid;          // Content Identifier (CID)

    // Publicly accessible fields
    string public date;         // Upload date
    uint256 public year;        // Year of upload
    address public manager;     // Manager address for the upload
    bool public isDeleted;      // Flag to indicate if the contract is deleted
    string public name;         // Name of the upload  

    // Authorization data
    mapping(string => bool) public approved;
    uint256 public authorizationCount;  // Count of authorizations

    // Modifier to restrict function access to the manager when the contract is not deleted
    modifier onlyManager() {
        require(msg.sender == manager, "Only the manager can call this function");
        _;
    }

    // Modifier to restrict function access if the contract is not deleted
    modifier notDeleted() {
        require(!isDeleted, "Contract has been deleted");
        _;
    }

    constructor(
        string memory _cid,
        string memory _date,
        uint256 _year,
        address _manager,
        string memory _name
    ) {
        cid = _cid;
        date = _date;
        year = _year;
        manager = _manager;
        name = _name;
        isDeleted = false;
        authorizationCount = 0; // Initialize count
    }

    // Function to authorize a given string (e.g., authorization code) restricted to manager
    function authorize(string memory authString) public onlyManager notDeleted {
        approved[authString] = true;
        authorizationCount += 1; // Increment authorization count
    }

    // Function to check if a given string is approved
    function isApproved(string memory authString) public view notDeleted returns (bool) {
        return approved[authString];
    }

    // Function to return all the details at once, no restriction on deletion status
    function getDetails() public view returns (
        string memory,
        uint256,
        address,
        string memory,
        uint256
    ) {
        return (date, year, manager, name,authorizationCount);
    }

    // Function to mark the contract as deleted
    function setDeleted(bool _isDeleted) public onlyManager {
        isDeleted = _isDeleted;
    }
    function getCid() public view returns (string memory) {
        return cid;
    }
}