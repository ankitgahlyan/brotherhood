import "@acton/build"
import "@acton/io"
import "@acton/emulation/network"
import "@acton/emulation/scripts"

import "@wrappers/DaoProxy.gen"
import "@contracts/common/constants"

import "utils/common"

fun main() {
    val admin = promptJettonWallet("JETTON_ADMIN", "Select Jetton Admin ActonWallet");
    val daoProxy = DaoProxy.fromAddress(DEPLOYED_DAO_PROXY_ADDRESS);

    println("Upgrading DaoProxy ({})...", daoProxy.address);
    val daoRes = daoProxy.sendHotUpgrade(
        admin.address,
        null,
        build("DaoProxy"),
        { value: grams("0.05") },
    );
    daoRes.waitForTrace();

    val currentTarget = daoProxy.getTargetAddress();
    if (currentTarget == null || currentTarget != DEPLOYED_FI_MINTER_ADDRESS) {
        println("Updating DaoProxy targetAddress to {}...", DEPLOYED_FI_MINTER_ADDRESS);
        val initRes = daoProxy.sendInitDaoProxy(
            admin.address,
            1,
            DEPLOYED_FI_MINTER_ADDRESS,
            { value: grams("0.05") },
        );
        initRes.waitForTrace();
    }
    println("DaoProxy targetAddress: {}", daoProxy.getTargetAddress());
}
