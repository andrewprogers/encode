pub trait Priority {
    fn priority(&self) -> i32;
}

#[derive(PartialEq)]
pub enum PriorityType {
    Max,
    Min
}

pub struct PriorityQueue<T: Priority> {
    storage: Vec<T>,
    queue_type: PriorityType
}

fn parent_index(index: usize) -> Option<usize> {
    if index == 0 {
        return None;
    }
    return Some((index - 1) / 2);
}

fn child_indices(index: usize) -> (usize, usize) {
    let left = 2 * index + 1;
    return (left, left + 1)
}

impl<T: Priority> PriorityQueue<T> {
    pub fn new(queue_type: PriorityType) -> PriorityQueue<T> {
        return PriorityQueue {
            storage: vec![],
            queue_type
        }
    }

    pub fn from_vec(vec: Vec<T>, queue_type: PriorityType) -> PriorityQueue<T> {
        let mut q = PriorityQueue {
            storage: vec,
            queue_type
        };

        // starting with last non-leaf node
        if let Some(mut index) = parent_index(q.storage.len() - 1) {
            loop {
                q.heapify(index);
                if index == 0 {
                    break;
                }
                index -= 1;
            }
        }

        return q;
    }

    pub fn empty(&self) -> bool {
        return self.storage.len() == 0;
    }

    pub fn insert(&mut self, item: T) {
        self.storage.push(item);
        let mut current_index = self.storage.len() - 1;
        
        loop {
            match parent_index(current_index) {
                None => break,
                Some(p_idx) => {
                    self.heapify(p_idx);
                    current_index = p_idx;
                }
            }
        }
    }

    pub fn remove(&mut self) -> Option<T> {
        let len = self.len();
        if len == 0 {
            return None;
        }

        let last_idx = len - 1;
        self.storage.swap(0, last_idx);
        let result = self.storage.pop().unwrap(); // Already checked for empty vec above
        self.heapify(0);
        return Some(result);
    }

    pub fn len(&self) -> usize {
        return self.storage.len();
    }

    fn get_index_with_priority(&self, a: usize, b: usize) -> usize {
        let a_greater: bool = self.storage[a].priority() > self.storage[b].priority();
        
        if a_greater {
            return if self.queue_type == PriorityType::Max {a} else {b} ;
        } else {
            return if self.queue_type == PriorityType::Max {b} else {a} ;
        }
    }

    fn heapify(&mut self, index: usize) {
        if index >= self.len() {
            return;
        }
        
        let (left, right) = child_indices(index);
        let mut priority_idx = index;
        if left < self.storage.len() {
            priority_idx = self.get_index_with_priority(left, priority_idx);
        }
        if right < self.storage.len() {
            priority_idx = self.get_index_with_priority(right, priority_idx);
        }

        if self.storage[priority_idx].priority() != self.storage[index].priority() {
            // perform a swap to bring up the largest priority item
            self.storage.swap(priority_idx, index);
            self.heapify(priority_idx);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    impl Priority for i32 {
        fn priority(&self) -> i32 {
            return *self;
        }
    }

    #[test]
    fn new_creates_empty_max_priority_queue() {
        let q = PriorityQueue::<i32>::new(PriorityType::Max);
        assert_eq!(q.empty(), true);
    }

    #[test]
    fn adds_new_items_to_the_queue() {
        let mut q = PriorityQueue::<i32>::new(PriorityType::Max);
        q.insert(10);
        q.insert(100);
        q.insert(1);
        assert_eq!(q.len(), 3);
    }

    #[test]
    fn removes_max_element() {
        let mut q = PriorityQueue::<i32>::new(PriorityType::Max);
        q.insert(10);
        q.insert(100);
        q.insert(1);
        assert_eq!(q.remove().unwrap(), 100);
        assert_eq!(q.len(), 2);

        assert_eq!(q.remove().unwrap(), 10);
    }

    #[test]
    fn creates_queue_from_vec() {
        let src = vec![1, 2, 3, 4];
        let mut q = PriorityQueue::from_vec(src, PriorityType::Max);
        assert_eq!(q.remove().unwrap(), 4);
        assert_eq!(q.remove().unwrap(), 3);
    }

    #[test]
    fn min_queue_removes_min_element() {
        let mut q = PriorityQueue::<i32>::new(PriorityType::Min);
        q.insert(10);
        q.insert(100);
        q.insert(1);
        assert_eq!(q.remove().unwrap(), 1);
        assert_eq!(q.remove().unwrap(), 10);
        assert_eq!(q.remove().unwrap(), 100);
    }
}