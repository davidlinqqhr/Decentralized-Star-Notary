const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    name = 'awesome star!'
    story = 'a love story'
    ra = "ra_032.155"
    dec = "dec_121.874"
    mag = "mag_245.978"

    describe('can create a star', () => { 
        it('can create a star and get its info', async function () { 
            await this.contract.createStar(name, story, ra, dec, mag, 1, {from: accounts[0]})

            retStar = await this.contract.tokenIdToStarInfo(1);
            retName = retStar[0].toString()
            retStory = retStar[1].toString()
            retRa = retStar[2].toString()
            retDec = retStar[3].toString()
            retMag = retStar[4].toString()

            assert.equal(retName, name)
            assert.equal(retStory, story)
            assert.equal(retRa, ra)
            assert.equal(retDec, dec)
            assert.equal(retMag, mag)
        })
    })

    describe('check if star exists', () => {
        it('star already exists', async function () {
            await this.contract.createStar(name, story, ra, dec, mag, 1, {from: accounts[0]})

            assert.equal(await this.contract.checkIfStarExist(ra, dec, mag), true)
        })
    })

    describe('check star owner', () => {
        it('star has the rightful owner', async function () {
            await this.contract.createStar(name, story, ra, dec, mag, 1, {from: accounts[0]})
            var owner = await this.contract.ownerOf(1, {from: accounts[0]})

            assert.equal(owner, accounts[0])
        })
    })

    describe('buying and selling stars', () => { 
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]
        
        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () { 
            await this.contract.createStar(name, story, ra, dec, mag, starId, {from: user1})    
        })

        it('user1 can put up their star for sale', async function () { 
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })
})