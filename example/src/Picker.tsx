import React, {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Dimensions,
} from 'react-native';
import { COLORS } from './App';

export type Item = {
  name: string;
  value: string;
};

export type Items = Array<Item>;

type Props = {
  name: string;
  items: Items;
  onSelect: (selectedItemIndex: number) => void;
  selectedItemIndex?: number;
  show: boolean;
  setShow: (show: boolean) => void;
};

const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;

export const Picker = ({
  name,
  show,
  setShow,
  onSelect,
  items,
  selectedItemIndex,
}: Props) => {
  if (!show) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>{`${name}:`}</Text>
        </View>
        <Pressable onPress={() => setShow(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <ScrollView>
          {items.map((item, index) => {
            return (
              <Pressable
                key={item.value}
                onPress={() => onSelect(index)}
                style={[
                  styles.button,
                  index === selectedItemIndex && styles.selectedButton,
                ]}
              >
                <Text style={styles.buttonPrimaryText}>{item.name}</Text>
                <Text style={styles.buttonSecondaryText}>{item.value}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: HEIGHT,
    width: WIDTH,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: WIDTH - 24,
    height: HEIGHT / 2,
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    padding: 8,
  },
  selectedButton: {
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonPrimaryText: {
    fontSize: 16,
  },
  buttonSecondaryText: {
    fontSize: 12,
    color: '#888888',
  },
});
