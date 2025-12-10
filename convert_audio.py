import os
import binascii
import subprocess

# Configuration
ROOT_DIR = '/home/eric/Game/Amelie/www/audio'
KEY_HEX = 'd41d8cd98f00b204e9800998ecf8427e'
HEADER_LEN = 16
SIGNATURE = b'RPGMV\x00\x00\x00\x00\x03\x01\x00\x00\x00\x00\x00'

def get_key_bytes(hex_key):
    return binascii.unhexlify(hex_key)

def xor_bytes(data, key):
    return bytes(a ^ b for a, b in zip(data, key))

def decrypt_rpgmvo(input_path, output_ogg):
    with open(input_path, 'rb') as f:
        header = f.read(HEADER_LEN)
        if len(header) != HEADER_LEN:
            return False
        
        # Read the encrypted block (next 16 bytes)
        encrypted_block = f.read(16)
        if not encrypted_block:
            return False
            
        key = get_key_bytes(KEY_HEX)
        decrypted_block = xor_bytes(encrypted_block, key)
        
        # Read the rest of the file
        rest_of_file = f.read()
        
    with open(output_ogg, 'wb') as out:
        out.write(decrypted_block)
        out.write(rest_of_file)
    
    return True

def encrypt_to_rpgmvm(input_m4a, output_rpgmvm):
    with open(input_m4a, 'rb') as f:
        data = f.read()
        
    if len(data) < 16:
        # Too short, just write as is? Or pad? M4A should be longer.
        return False
        
    first_block = data[:16]
    rest_of_data = data[16:]
    
    key = get_key_bytes(KEY_HEX)
    encrypted_block = xor_bytes(first_block, key)
    
    with open(output_rpgmvm, 'wb') as out:
        out.write(SIGNATURE)
        out.write(encrypted_block)
        out.write(rest_of_data)
        
    return True

def convert_file(rpgmvo_path):
    base_name = os.path.splitext(rpgmvo_path)[0]
    ogg_path = base_name + '.temp.ogg'
    m4a_path = base_name + '.temp.m4a'
    rpgmvm_path = base_name + '.rpgmvm'
    
    # Check if target already exists (optional, maybe overwrite)
    # user said "ensure is same", so regeneration is good.
    
    print(f"Processing {rpgmvo_path}...")
    
    # 1. Decrypt
    if not decrypt_rpgmvo(rpgmvo_path, ogg_path):
        print(f"Failed to decrypt {rpgmvo_path}")
        return
        
    # 2. Convert OGG -> M4A
    # Use ffmpeg
    try:
        subprocess.run(
            ['ffmpeg', '-y', '-v', 'error', '-i', ogg_path, '-acodec', 'aac', '-b:a', '128k', m4a_path],
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg failed for {ogg_path}: {e}")
        if os.path.exists(ogg_path): os.remove(ogg_path)
        return

    # 3. Encrypt to rpgmvm
    if encrypt_to_rpgmvm(m4a_path, rpgmvm_path):
        print(f"Created {rpgmvm_path}")
    else:
        print(f"Failed to encrypt {m4a_path}")

    # Cleanup
    if os.path.exists(ogg_path): os.remove(ogg_path)
    if os.path.exists(m4a_path): os.remove(m4a_path)

def main():
    # Walk through audio directories (bgm, bgs, me, se)
    # Audio folder provided in logs: /audio/bgm, /audio/se
    # We should process recursively from audio root.
    
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith('.rpgmvo'):
                full_path = os.path.join(root, file)
                # Check if matching .rpgmvm exists? 
                # User report implies missing files, so we generate.
                # If we want to be safe, we can regenerate all.
                convert_file(full_path)

if __name__ == '__main__':
    main()
