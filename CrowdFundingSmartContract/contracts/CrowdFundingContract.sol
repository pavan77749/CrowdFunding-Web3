// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

contract CampaignFactory {
    address[] public deployCampaigns;

    event CampaignCreated( 
        string title, 
        uint requiredAmount,
        address indexed owner,
        address campaignAddress,
        string imageURL,
        uint indexed timestamp, 
        string indexed  category);

    function createCampaign (
        string memory CampaignName, 
        uint256 requiredCampaignAmount ,
        string memory ImageUrl,
        string memory Category,
        string memory descriptionCampaign) public {
        Campaign newCampaign = new Campaign(CampaignName, requiredCampaignAmount, descriptionCampaign, ImageUrl);
        deployCampaigns.push(address(newCampaign));

        emit CampaignCreated
        (CampaignName, 
        requiredCampaignAmount,
        msg.sender,
        address(newCampaign), 
        ImageUrl,
        block.timestamp, 
        Category );
    }
}

contract Campaign {
    string public title;
    string public description;
    uint public requiredAmount;
    uint public receivedAmount;
    string public image;
    address payable public owner;
    bool public isFulfilled = false;

    event Donated(address indexed sender, uint indexed amount, uint indexed timestamp);

    constructor(
        string memory _title,
        uint _requiredAmount,
        string memory _description,
        string memory _image
    ) {
        title = _title;
        requiredAmount = _requiredAmount;
        description = _description;
        image = _image;
        owner = payable(msg.sender);
    }

    function donation() public payable {
        require(!isFulfilled, "Campaign already fulfilled");
        require(msg.value > 0, "Donation must be more than 0");
        require(receivedAmount + msg.value <= requiredAmount, "Donation exceeds goal");

        owner.transfer(msg.value);
        receivedAmount += msg.value;

        if (receivedAmount >= requiredAmount) {
            isFulfilled = true;
        }

        emit Donated(msg.sender, msg.value, block.timestamp);
    }

    receive() external payable {
        donation();
    }
}
