use bitstream_io::{BitReader, BitWriter, BigEndian};
use super::priority_queue::*;
use std::collections::HashMap;
use std::convert::TryInto;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn test() {
    console_log!("Hello")
}

#[wasm_bindgen]
pub struct HuffmanEncoder {
}
#[wasm_bindgen]
impl HuffmanEncoder {
    pub fn new() -> HuffmanEncoder {
        return HuffmanEncoder {};
    }

    pub fn encode_bytes(input: &[u8]) -> Box<[u8]> {
        let vec = HuffmanCode::compress_bytes(input);
        vec.into_boxed_slice()
    }
}

fn count_bytes(input: &[u8]) -> HashMap<u8, i32> {
    let mut map: HashMap<u8, i32> = HashMap::new();

    for b in input {
        let value_ref = map.entry(*b).or_insert(0);
        *value_ref += 1;
    }
    return map;
}

enum HuffmanNode {
    Nonleaf {
        priority: i32,
        left: Box<HuffmanNode>,
        right: Box<HuffmanNode>
    },
    Leaf {
        byte: u8,
        priority: i32,
    }
}

pub struct HuffmanCode {
    root: HuffmanNode,
    dict: Option<HashMap<u8, Vec<bool>>>
}

impl HuffmanCode {
    pub fn compress_string(input: &str) -> Vec<u8> {
        Self::compress_bytes(input.as_bytes())
    }

    // Compressed format:
    // 4 bytes: num bytes for tree
    // tree bytes (possibly some wasted bits in last byte)
    // 4 bytes: original number of bytes
    // encoded bytes (possibly some wasted bits in last byte)

    pub fn compress_bytes(input: &[u8]) -> Vec<u8> {
        let mut tree = match Self::build_encoding(input) {
            Some(tree) => tree,
            None => return input.to_owned()
        };
    
        let mut tree_bytes = tree.serialiaze();
        let mut tree_len_bytes = (tree_bytes.len() as u32).to_be_bytes().to_vec();
        let mut input_len_bytes = (input.len() as u32).to_be_bytes().to_vec();
        let mut body_bytes = tree.encode(input);

        let mut compressed: Vec<u8> = Vec::new();
        compressed.append(&mut tree_len_bytes);
        compressed.append(&mut tree_bytes);
        compressed.append(&mut input_len_bytes);
        compressed.append(&mut body_bytes);
        return compressed;
    }

    pub fn decompress_bytes(input: &[u8]) -> Vec<u8> {
        let tree_len_bytes = &input[..4];
        let tree_len = u32::from_be_bytes(tree_len_bytes.try_into().unwrap()) as usize;
        
        let tree_bytes = &input[4..(tree_len + 4)];
        let tree = HuffmanCode::deserialize(tree_bytes);

        let num_encoded_bytes = u32::from_be_bytes(input[(tree_len + 4)..(tree_len + 8)].try_into().unwrap());

        let remaining_bytes = &input[(tree_len + 8)..];
        tree.decode(remaining_bytes, num_encoded_bytes)
    }

    fn build_encoding(input: &[u8]) -> Option<HuffmanCode> {
        if input.len() == 0 {
            return None;
        }
        
        let counts = count_bytes(input);

        // map counts into Leaf nodes
        let nodes: Vec<HuffmanNode> = counts.into_iter().map(|(byte, count)| {
            HuffmanNode::new_leaf(byte, count)
        }).collect();

        // Take the lowest priority nodes and combine them into one node repeatedly to build tree
        let mut queue = PriorityQueue::from_vec(nodes, PriorityType::Min);
        while queue.len() > 1 {
            let first = queue.remove().unwrap();
            let second = queue.remove().unwrap();
            let new_node = HuffmanNode::combine(first, second);
            queue.insert(new_node);
        }

        queue.remove().map(|node| HuffmanCode {
            root: node,
            dict: None
        })
    }

    fn serialiaze(&self) -> Vec<u8> {
        let mut vec: Vec<u8> = Vec::new();
        let mut writer = BitWriter::endian(&mut vec, BigEndian);
        self.root.serialiaze(&mut writer);

        writer.byte_align();
        return vec;
    }

    pub fn deserialize(bytes: &[u8]) -> HuffmanCode {
        let mut reader = BitReader::endian(bytes, BigEndian);
        let root = HuffmanNode::deserialize(&mut reader);
        
        return HuffmanCode {
            root,
            dict: None
        }
    }

    fn encode(&mut self, bytes: &[u8]) -> Vec<u8> {
        let mut result = Vec::new();
        let mut buffer: u8 = 0;
        let mut bits_in_buffer: u8 = 0;

        let map = self.get_map();
        
        for b in bytes {
            let code = map.get(b).unwrap();
            for &bit in code {
                buffer = buffer << 1;
                bits_in_buffer += 1;
                if bit {
                    buffer = buffer | 1;
                }

                if bits_in_buffer == 8 {
                    result.push(buffer);
                    buffer = 0;
                    bits_in_buffer = 0;
                }
            }
        }

        // pad buffer to create full byte
        if bits_in_buffer > 0 {
            buffer = buffer << (8 - bits_in_buffer);
            result.push(buffer)
        }
        
        return result;
    }

    fn decode(&self, bytes: &[u8], num_encoded: u32) -> Vec<u8> {
        let mut bytes_decoded = 0;
        let mut bit_reader = BitReader::endian(bytes, BigEndian);
        let mut decoded = Vec::new();

        while bytes_decoded < num_encoded {
            let byte = self.root.decode(&mut bit_reader);
            decoded.push(byte);
            bytes_decoded += 1;
        }
        return decoded;
    }

    fn get_map(&mut self) -> &HashMap<u8, Vec<bool>> {
        if self.dict == None {
            let mut map: HashMap<u8, Vec<bool>> = HashMap::new();
            self.root.build_encoding_map(&mut map, Vec::new());
            self.dict = Some(map);
        };

        self.dict.as_ref().unwrap()
    }
}

impl Priority for HuffmanNode {
    fn priority(&self) -> i32 {
        match self {
            HuffmanNode::Nonleaf {priority, left: _, right: _} => *priority,
            HuffmanNode::Leaf {byte: _, priority} => *priority
        }
    }
}

impl HuffmanNode {
    fn new_leaf(byte: u8, count: i32) -> HuffmanNode {
        return HuffmanNode::Leaf {
            byte,
            priority: count
        }
    }

    fn combine(node1: HuffmanNode, node2: HuffmanNode) -> HuffmanNode {
        return HuffmanNode::Nonleaf {
            priority: node1.priority() + node2.priority(),
            left: Box::new(node1),
            right: Box::new(node2)
        }
    }

    fn print_spaces(i: usize) {
        let mut i = i;
        while i > 0 {
            print!(" ");
            i -= 1;
        }
    }

    pub fn print_tree(&self, mut prefix: String) {
        Self::print_spaces(prefix.len());
        match self {
            HuffmanNode::Nonleaf {priority, left, right} => {
                println!("Nonleaf (prefix: {})", prefix);
                prefix.push('0');
                Self::print_tree(left, prefix.to_owned());
                prefix.pop();
                prefix.push('1');
                Self::print_tree(right, prefix);
            },
            HuffmanNode::Leaf {byte, priority} => {
                println!("{} (prefix: {})", byte, prefix);
            }
        };
    }

    fn serialiaze(&self, writer: &mut BitWriter<&mut Vec<u8>, BigEndian>) {
        match self {
            HuffmanNode::Nonleaf {priority: _, left, right} => {
                writer.write_bit(false);
                left.serialiaze(writer);
                right.serialiaze(writer);
            },
            HuffmanNode::Leaf {byte, priority: _} => {
                writer.write_bit(true);
                let bytes: [u8; 1] = [*byte];
                writer.write_bytes(&bytes);
            }
        }
    }

    fn deserialize(reader: &mut BitReader<&[u8], BigEndian>) -> HuffmanNode {
        let bit = reader.read_bit().unwrap();
        match bit {
            false => {
                // nonleaf node
                let left = HuffmanNode::deserialize(reader);
                let right = HuffmanNode::deserialize(reader);
                return HuffmanNode::combine(left, right);
            },
            true => {
                let mut bytes: [u8; 1] = [0; 1];
                reader.read_bytes(&mut bytes);
                return HuffmanNode::Leaf {
                    byte: bytes[0],
                    priority: 0
                }
            }
        }
    }

    fn build_encoding_map(&mut self, map: &mut HashMap<u8, Vec<bool>>, encoding: Vec<bool>) {
        match self {
            HuffmanNode::Leaf {byte, priority: _} => { 
                map.insert(*byte, encoding);
            },
            HuffmanNode::Nonleaf {priority: _, left, right} => {
                let mut left_encoding = encoding.clone();
                left_encoding.push(false);
                left.build_encoding_map(map, left_encoding);

                let mut right_encoding = encoding;
                right_encoding.push(true);
                right.build_encoding_map(map, right_encoding);
            }
        };
    }

    fn decode(&self, reader: &mut BitReader<&[u8], BigEndian>) -> u8 {
        match self {
            HuffmanNode::Leaf {byte, priority: _} => *byte,
            HuffmanNode::Nonleaf {priority: _, left, right} => {
                match reader.read_bit().unwrap() {
                    false => left.decode(reader),
                    true => right.decode(reader)
                }
            }
        }
    }
}