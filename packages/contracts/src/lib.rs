#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, String, Symbol, Vec, Map,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin = 0,
    Signers = 1,
    TimeLimit = 2,
    Conditions = 3,
    EscrowData = 4,
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowData {
    pub sender: Address,
    pub receiver: Address,
    pub amount: i128,
    pub release_time: u64,
    pub conditions_met: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct MultiSigData {
    pub required_signatures: u32,
    pub signers: Vec<Address>,
    pub signed: Vec<bool>,
}

#[contracttype]
#[derive(Clone)]
pub struct ConditionalPayment {
    pub sender: Address,
    pub receiver: Address,
    pub amount: i128,
    pub conditions: Vec<String>,
    pub conditions_met: Vec<bool>,
}

#[contract]
pub struct StellarSmartContracts;

#[contractimpl]
impl StellarSmartContracts {
    // Função de inicialização
    pub fn initialize(env: Env, admin: Address) {
        if !env.storage().instance().has(&DataKey::Admin) {
            env.storage().instance().set(&DataKey::Admin, &admin);
        }
    }

    // Funções para Multi-signature
    pub fn setup_multisig(env: Env, required_signatures: u32, signers: Vec<Address>) {
        let admin = env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut signed = Vec::new(&env);
        for _ in 0..signers.len() {
            signed.push_back(false);
        }
        let data = MultiSigData {
            required_signatures,
            signers: signers.clone(),
            signed,
        };
        env.storage().instance().set(&DataKey::Signers, &data);
    }

    pub fn sign_transaction(env: Env, signer: Address) -> bool {
        signer.require_auth();
        
        let mut data = env.storage().instance().get::<_, MultiSigData>(&DataKey::Signers).unwrap();
        let index = data.signers.iter().position(|s| s == signer).unwrap() as u32;
        data.signed.set(index, true);
        
        let signatures = data.signed.iter().filter(|s| *s).count() as u32;
        env.storage().instance().set(&DataKey::Signers, &data);
        
        signatures >= data.required_signatures
    }

    // Funções para Time-bound
    pub fn set_time_limit(env: Env, deadline: u64) {
        let admin = env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::TimeLimit, &deadline);
    }

    pub fn check_time_valid(env: Env) -> bool {
        let deadline = env.storage().instance().get::<_, u64>(&DataKey::TimeLimit).unwrap();
        env.ledger().timestamp() < deadline
    }

    // Funções para Pagamento Condicional
    pub fn setup_conditional_payment(
        env: Env,
        sender: Address,
        receiver: Address,
        amount: i128,
        conditions: Vec<String>
    ) {
        sender.require_auth();
        
        let mut conditions_met = Vec::new(&env);
        for _ in 0..conditions.len() {
            conditions_met.push_back(false);
        }
        let payment = ConditionalPayment {
            sender,
            receiver,
            amount,
            conditions,
            conditions_met,
        };
        env.storage().instance().set(&DataKey::Conditions, &payment);
    }

    pub fn fulfill_condition(env: Env, condition_index: u32) {
        let mut payment = env.storage().instance().get::<_, ConditionalPayment>(&DataKey::Conditions).unwrap();
        payment.conditions_met.set(condition_index, true);
        env.storage().instance().set(&DataKey::Conditions, &payment);
    }

    pub fn check_all_conditions_met(env: Env) -> bool {
        let payment = env.storage().instance().get::<_, ConditionalPayment>(&DataKey::Conditions).unwrap();
        payment.conditions_met.iter().all(|met| met)
    }

    // Funções para Escrow
    pub fn create_escrow(
        env: Env,
        sender: Address,
        receiver: Address,
        amount: i128,
        release_time: u64
    ) {
        sender.require_auth();
        
        let escrow = EscrowData {
            sender,
            receiver,
            amount,
            release_time,
            conditions_met: false,
        };
        env.storage().instance().set(&DataKey::EscrowData, &escrow);
    }

    pub fn release_escrow(env: Env) -> bool {
        let escrow = env.storage().instance().get::<_, EscrowData>(&DataKey::EscrowData).unwrap();
        
        if env.ledger().timestamp() >= escrow.release_time {
            env.storage().instance().set(&DataKey::EscrowData, &EscrowData {
                conditions_met: true,
                ..escrow
            });
            true
        } else {
            false
        }
    }

    // Função auxiliar para verificar o estado do contrato
    pub fn get_contract_data(env: Env) -> Map<Symbol, String> {
        let mut data = Map::new(&env);
        
        if let Some(admin) = env.storage().instance().get::<_, Address>(&DataKey::Admin) {
            data.set(Symbol::new(&env, "admin"), admin.to_string());
        }
        
        data
    }
}

#[cfg(test)]
mod test; 